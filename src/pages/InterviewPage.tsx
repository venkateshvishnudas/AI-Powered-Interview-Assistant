import { useState } from 'react'
import CandidatesTable from '../components/CandidatesTable'
import CandidateDetail from '../components/CandidateDetail'

export default function InterviewerPage() {
  const [openId, setOpenId] = useState<string | undefined>(undefined)
  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>Dashboard</h2>
      <CandidatesTable onOpen={setOpenId} />
      <CandidateDetail id={openId} onClose={() => setOpenId(undefined)} />
    </div>
  )
}
