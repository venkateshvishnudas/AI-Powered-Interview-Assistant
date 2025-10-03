import { GoogleGenerativeAI } from "@google/generative-ai"
import type { QA } from "../slices/interviewSlice"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

// ✅ Heuristic fallback (simple)
export function heuristicEvaluate(qas: QA[]) {
  const scored = qas.map((q) => {
    const base = q.answer?.length || 0
    const score = base > 30 ? 6 : base > 10 ? 4 : 2
    return { ...q, score, feedback: "Heuristic evaluation applied." }
  })
  const avg = Math.round(scored.reduce((sum, q) => sum + (q.score ?? 0), 0) / scored.length)
  return { qas: scored, finalScore: avg, summary: `Candidate answered ${scored.length} questions. Avg score: ${avg}.` }
}

// ✅ Full AI evaluation at the end
export async function aiEvaluateInterview(candidateName: string, qas: QA[]) {
  const prompt = `
    Candidate: ${candidateName}
    Interview Q&A:
    ${JSON.stringify(qas, null, 2)}

    Evaluate each answer:
    - Add a "score" (0-10) and "feedback" for every Q&A.
    - Provide a final numeric score (0-10 average).
    - Provide a 2-3 sentence summary.

    Respond in JSON ONLY:
    {
      "qas": [ { "question": "...", "answer": "...", "score": 7, "feedback": "..." } ],
      "finalScore": 6,
      "summary": "..."
    }
  `

  const res = await model.generateContent(prompt)
  let text = res.response.text().trim()
  text = text.replace(/```json/i, "").replace(/```/g, "").trim()

  try {
    const parsed = JSON.parse(text)
    return parsed
  } catch {
    return heuristicEvaluate(qas)
  }
}
