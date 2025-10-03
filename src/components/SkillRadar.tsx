import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

type SkillRadarProps = {
  scores: {
    react: number
    node: number
    apis: number
    problemSolving: number
    communication: number
  }
}

export default function SkillRadar({ scores }: SkillRadarProps) {
  const data = [
    { skill: "React", value: scores.react },
    { skill: "Node", value: scores.node },
    { skill: "APIs", value: scores.apis },
    { skill: "Problem Solving", value: scores.problemSolving },
    { skill: "Communication", value: scores.communication },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={30} domain={[0, 10]} />
        <Radar
          name="Candidate"
          dataKey="value"
          stroke="#1890ff"
          fill="#1890ff"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
