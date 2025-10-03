import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import type { ResumeFields } from '../slices/resumeSlice'

// 👇 required for pdfjs worker when using vite
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker&url'
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker

const emailRe = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i
const phoneRe = /(\+?\d[\d\s\-().]{8,}\d)/ // crude but works
const nameLabelRe = /name\s*[:\-]\s*([^\n\r]+)/i

export async function parseResume(file: File): Promise<ResumeFields> {
  const ext = file.name.toLowerCase().split('.').pop()
  let text = ''
  try {
    if (ext === 'pdf') {
      text = await readPdf(file)
    } else if (ext === 'docx') {
      text = await readDocx(file)
    } else {
      throw new Error('Unsupported file type. Please upload PDF (preferred) or DOCX.')
    }
  } catch (e: any) {
    throw new Error(e?.message ?? 'Failed to read file')
  }

  const email = text.match(emailRe)?.[1]
  const phone = text.match(phoneRe)?.[1]?.replace(/\s+/g, ' ')
  let name: string | undefined
  const nameLabel = text.match(nameLabelRe)?.[1]
  if (nameLabel) name = sanitize(nameLabel)
  if (!name) {
    const line = text
      .split(/\r?\n/)
      .map(s => s.trim())
      .find(l => /^[A-Z][a-zA-Z]+ [A-Z][a-zA-Z\-]+/.test(l))
    if (line) name = line.replace(/[,|].*$/, '')
  }
  return { name, email, phone }
}

function sanitize(s: string) {
  return s.replace(/[^a-zA-Z \-'.]/g, '').trim()
}

async function readPdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  let full = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((it: any) => it.str).join(' ')
    full += pageText + '\n'
  }
  return full
}

async function readDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const res = await mammoth.extractRawText({ arrayBuffer })
  return res.value ?? ''
}
