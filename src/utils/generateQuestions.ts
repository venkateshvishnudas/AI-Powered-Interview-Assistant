import { GoogleGenerativeAI } from "@google/generative-ai"
import type { QA } from "../slices/interviewSlice"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

const limits: Record<"easy" | "medium" | "hard", number> = {
  easy: 20,
  medium: 60,
  hard: 120,
}

export async function fetchAIQuestions(resumeText: string): Promise<QA[]> {
  const prompt = `
    You are an interviewer for a Full Stack React/Node developer.
    Candidate's resume:
    ---
    ${resumeText}
    ---
    Generate 6 interview questions as a valid JSON array ONLY.
    - 2 easy, 2 medium, 2 hard
    - Format: [{"question":"...", "difficulty":"easy|medium|hard"}, ...]
    - No extra text, no explanation, just raw JSON.
  `

  const res = await model.generateContent(prompt)
  let text = res.response.text().trim()

  // 🧹 Remove code fences if Gemini adds them
  text = text.replace(/```json/i, "").replace(/```/g, "").trim()

  let parsed: any[]
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    console.error("❌ Gemini JSON parse failed:", text)
    throw new Error("Gemini did not return valid JSON.")
  }

  return parsed.map((q, i): QA => ({
    id: `Q${i}`,
    question: q.question,
    difficulty: q.difficulty,
    timeLimitSec: limits[q.difficulty as "easy" | "medium" | "hard"],
  }))
}
