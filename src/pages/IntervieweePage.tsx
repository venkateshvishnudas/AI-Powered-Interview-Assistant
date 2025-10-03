import { useMemo, useState, useCallback } from "react"
import { Card, Input, Button, Typography, Space, message, Progress } from "antd"
import ResumeUpload from "../components/ResumeUpload"
import ChatWindow, { ChatMsg } from "../components/ChatWindow"
import { useAppDispatch, useAppSelector } from "../store"
import { setField } from "../slices/resumeSlice"
import {
  beginInterview,
  finishInterview,
  nextQuestion,
  submitAnswer,
} from "../slices/interviewSlice"
import { aiEvaluateInterview, heuristicEvaluate } from "../utils/scoring"
import { addCandidate } from "../slices/candidatesSlice"
import { useCountdown } from "../hooks/useCountDown"
import { fetchAIQuestions } from "../utils/generateQuestions"

const { Title } = Typography

export default function IntervieweePage() {
  const dispatch = useAppDispatch()
  const resume = useAppSelector((s) => s.resume)
  const interview = useAppSelector((s) => s.interview)

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "system",
      text: "Upload your resume. Missing details will be asked before starting.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  // Missing-field prompt
  const missingPrompt = useMemo(() => {
    const m = resume.missing[0]
    if (!m) return ""
    if (m === "name") return "What is your full name?"
    if (m === "email") return "What is your email address?"
    return "What is your phone number?"
  }, [resume.missing])

  const canStart = resume.status === "parsed" && resume.missing.length === 0

  // ✅ Finalize interview
  const finishCandidateInterview = useCallback(
    async (qasOverride?: typeof interview.qas) => {
      const fields = resume.fields
      const qas = qasOverride ?? interview.qas

      let result: { finalScore: number; summary: string; qas: typeof qas }
      try {
        result = await aiEvaluateInterview(fields.name ?? "Candidate", qas)
      } catch {
        result = heuristicEvaluate(qas)
      }

      const candidateId = crypto.randomUUID()

      dispatch(
        finishInterview({
          finalScore: result.finalScore,
          summary: result.summary,
          candidateId,
        })
      )

      const stampedChat = messages.map((m) => ({
        ...m,
        ts: new Date().toISOString(),
      }))

      dispatch(
        addCandidate({
          id: candidateId,
          name: fields.name?.trim() || "Unknown Candidate",
          email: fields.email?.trim() || "-",
          phone: fields.phone?.trim() || "-",
          score: result.finalScore,
          summary: result.summary,
          chat: stampedChat,
          qas: result.qas,
        })
      )

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `✅ Interview complete. Final Score: ${result.finalScore}. Summary: ${result.summary}`,
        },
      ])
      message.success("Interview finished!")
    },
    [dispatch, interview.qas, messages, resume.fields]
  )

  // 📝 Handle answers
  const handleAnswer = useCallback(
    (answer: string, auto = false) => {
      if (interview.status !== "running") return
      const idx = interview.currentIndex
      const qa = interview.qas[idx]
      if (!qa) return
      if (qa.answer) return

      dispatch(submitAnswer({ index: idx, answer, auto }))
      setInput("")

      const next = interview.qas[idx + 1]
      if (next) {
        dispatch(nextQuestion())
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: auto
              ? "(⏱️ Time up) Answer saved. Moving to next question..."
              : "Answer noted. Moving to next question...",
          },
          {
            role: "assistant",
            text: `[${next.difficulty.toUpperCase()}] ${next.question} (${next.timeLimitSec}s)`,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: auto
              ? "(⏱️ Time up) Final answer saved. Wrapping up..."
              : "Final answer noted. Wrapping up...",
          },
        ])
        const updatedQas = interview.qas.map((q, i) =>
          i === idx ? { ...q, answer } : q
        )
        finishCandidateInterview(updatedQas)
      }
    },
    [dispatch, interview, finishCandidateInterview]
  )

  // ⏱ Auto-submit on timeout
  const remaining = useCountdown(interview.deadline, () =>
    handleAnswer(input || "", true)
  )

  // 🚀 Start interview with AI questions
  async function startInterview() {
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "🤖 Fetching AI-generated questions..." },
    ])

    try {
      const qas = await fetchAIQuestions(resume.fullText || "")

      dispatch(beginInterview({ qas, nowISO: new Date().toISOString() }))

      const first = qas[0]
      if (first) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "🎯 Interview started with AI-generated questions." },
          {
            role: "assistant",
            text: `[${first.difficulty.toUpperCase()}] ${first.question} (${first.timeLimitSec}s)`,
          },
        ])
      }
    } catch (err) {
      console.error(err)
      message.error("AI question generation failed. Falling back to demo set.")

      const fallbackQas = [
        {
          id: "Q1",
          question: "What is the difference between state and props in React?",
          difficulty: "easy" as const,
          timeLimitSec: 20,
        },
        {
          id: "Q2",
          question: "What is npm and why is it used in Node.js projects?",
          difficulty: "easy" as const,
          timeLimitSec: 20,
        },
      ]

      dispatch(beginInterview({ qas: fallbackQas, nowISO: new Date().toISOString() }))

      const first = fallbackQas[0]
      if (first) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "⚡ Using fallback demo questions." },
          {
            role: "assistant",
            text: `[${first.difficulty.toUpperCase()}] ${first.question} (${first.timeLimitSec}s)`,
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  // 💬 Handle user input
  function handleUserSubmit() {
    const trimmed = input.trim()
    if (!trimmed) return

    setMessages((prev) => [...prev, { role: "user", text: trimmed }])

    const key = resume.missing[0]
    if (key) {
      dispatch(setField({ key, value: trimmed }))
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Got it. ${missingPrompt ? "Next: " + missingPrompt : ""}`,
        },
      ])
      setInput("")
      return
    }

    handleAnswer(trimmed)
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Resume Upload */}
      <Card title="Resume Upload">
        <ResumeUpload />
        {resume.missing.length > 0 && resume.status === "parsed" && (
          <Card size="small" style={{ marginTop: 8 }}>
            {missingPrompt}
          </Card>
        )}
        <Button
          type="primary"
          disabled={!canStart || interview.status === "running" || loading}
          loading={loading}
          onClick={startInterview}
          style={{ marginTop: 12 }}
        >
          Start Interview
        </Button>
      </Card>

      {/* Chat + Timer */}
      <Card
        title={
          <Space>
            <Title level={5}>Chat</Title>
            {remaining !== null && interview.status === "running" && (
              <Progress
                type="circle"
                percent={
                  (remaining /
                    (interview.qas[interview.currentIndex]?.timeLimitSec || 1)) *
                  100
                }
                format={() => `${remaining}s`}
                size={60}
              />
            )}
          </Space>
        }
      >
        <ChatWindow messages={messages} />
        <Space.Compact style={{ marginTop: 12, width: "100%" }}>
          <Input
            placeholder="Type your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleUserSubmit}
            disabled={loading}
          />
          <Button type="primary" onClick={handleUserSubmit} disabled={loading}>
            Send
          </Button>
        </Space.Compact>
      </Card>
    </Space>
  )
}
