import { Modal, List, Card } from "antd"
import { useAppSelector } from "../store"
import SkillRadar from "../components/SkillRadar"

export default function CandidateDetail({
  id,
  onClose,
}: {
  id?: string
  onClose: () => void
}) {
  const candidate = useAppSelector((s) =>
    s.candidates.list.find((c) => c.id === id)
  )

  if (!candidate) {
    return (
      <Modal
        open={!!id}
        onCancel={onClose}
        onOk={onClose}
        width={720}
        title="Candidate Not Found"
      >
        <p>Candidate not found</p>
      </Modal>
    )
  }

  // 🧠 Map question categories → skills (basic demo mapping)
  const skillScores = {
    react: Math.round(
      candidate.qas
        .filter((q) => q.question.toLowerCase().includes("react"))
        .reduce((sum, q) => sum + (q.score ?? 0), 0) / (candidate.qas.length || 1)
    ) || 0,
    node: Math.round(
      candidate.qas
        .filter((q) => q.question.toLowerCase().includes("node"))
        .reduce((sum, q) => sum + (q.score ?? 0), 0) / (candidate.qas.length || 1)
    ) || 0,
    apis: Math.round(
      candidate.qas
        .filter((q) => q.question.toLowerCase().includes("api"))
        .reduce((sum, q) => sum + (q.score ?? 0), 0) / (candidate.qas.length || 1)
    ) || 0,
    problemSolving: Math.round(
      candidate.qas
        .filter((q) => q.difficulty === "hard")
        .reduce((sum, q) => sum + (q.score ?? 0), 0) / (candidate.qas.length || 1)
    ) || 0,
    communication: Math.round(candidate.score) || 0, // fallback: overall score
  }

  return (
    <Modal
      open={!!id}
      onCancel={onClose}
      onOk={onClose}
      width={720}
      title={candidate.name}
    >
      <p>
        {candidate.email} • {candidate.phone} • Score:{" "}
        <b>{candidate.score}</b>
      </p>
      <p>{candidate.summary}</p>

      {/* 🎯 Skill Radar */}
      <Card title="Skill Radar" style={{ marginBottom: 16 }}>
        <SkillRadar scores={skillScores} />
      </Card>

      <h4>Q&A</h4>
      <List
        dataSource={candidate.qas}
        renderItem={(qa) => (
          <List.Item>
            <div>
              <div>
                <b>[{qa.difficulty}]</b> {qa.question}
              </div>
              <div>
                <b>Answer:</b> {qa.answer}
              </div>
              <div>
                <b>Score:</b> {qa.score}/10
              </div>
            </div>
          </List.Item>
        )}
      />

      <h4>Chat History</h4>
      <List
        dataSource={candidate.chat}
        renderItem={(m) => (
          <List.Item>
            <span style={{ fontSize: 12, color: "#888" }}>
              {new Date(m.ts).toLocaleString()} [{m.role}]
            </span>
            <div>{m.text}</div>
          </List.Item>
        )}
      />
    </Modal>
  )
}
