import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface QA {
  id: string
  question: string
  difficulty: "easy" | "medium" | "hard"
  timeLimitSec: number
  answer?: string
  score?: number
  feedback?: string
}

interface InterviewState {
  status: "idle" | "running" | "finished"
  qas: QA[]
  currentIndex: number
  deadline: string | null
  finalScore?: number
  summary?: string
  candidateId?: string
}

const initialState: InterviewState = {
  status: "idle",
  qas: [],
  currentIndex: 0,
  deadline: null,
}

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    beginInterview(state, action: PayloadAction<{ qas: QA[]; nowISO: string }>) {
      state.status = "running"
      state.qas = action.payload.qas
      state.currentIndex = 0
      const first = state.qas[0]
      if (first) {
        state.deadline = new Date(Date.now() + first.timeLimitSec * 1000).toISOString()
      } else {
        state.deadline = null
      }
    },
    submitAnswer(state, action: PayloadAction<{ index: number; answer: string; auto?: boolean }>) {
      const { index, answer } = action.payload
      const qa = state.qas[index]
      if (qa) qa.answer = answer
    },
    scoreAnswer(
      state,
      action: PayloadAction<{ index: number; score: number; feedback?: string }>
    ) {
      const { index, score, feedback } = action.payload
      const qa = state.qas[index]
      if (qa) {
        qa.score = score
        if (feedback) qa.feedback = feedback
      }
    },
    nextQuestion(state) {
      if (state.currentIndex < state.qas.length - 1) {
        state.currentIndex += 1
        const q = state.qas[state.currentIndex]
        if (q) {
          state.deadline = new Date(Date.now() + q.timeLimitSec * 1000).toISOString()
        } else {
          state.deadline = null
        }
      }
    },
    finishInterview(
      state,
      action: PayloadAction<{ finalScore: number; summary: string; candidateId: string }>
    ) {
      state.status = "finished"
      state.finalScore = action.payload.finalScore
      state.summary = action.payload.summary
      state.candidateId = action.payload.candidateId
      state.deadline = null
    },
  },
})

export const { beginInterview, submitAnswer, scoreAnswer, nextQuestion, finishInterview } =
  interviewSlice.actions
export default interviewSlice.reducer
