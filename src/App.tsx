import { useEffect, useState } from "react"
import { Layout, Tabs, Modal } from "antd"
import IntervieweePage from "./pages/IntervieweePage"
import InterviewerPage from "./pages/InterviewPage"
import { useAppSelector } from "./store"

const { Header, Content, Footer } = Layout

export default function App() {
  const [tab, setTab] = useState("interviewee")
  const interview = useAppSelector((s) => s.interview)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (interview.status === "running") {
      setShowModal(true)
    }
  }, [interview.status])

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            { key: "interviewee", label: "Interviewee" },
            { key: "interviewer", label: "Interviewer" },
          ]}
        />
      </Header>

      <Content style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
        {tab === "interviewee" ? <IntervieweePage /> : <InterviewerPage />}
      </Content>

      <Footer style={{ textAlign: "center" }}>
        Local-only demo • refresh-safe • timers survive reload
      </Footer>

      <Modal
        title="Welcome Back!"
        open={showModal}
        onOk={() => setShowModal(false)}
        onCancel={() => setShowModal(false)}
        okText="Resume Interview"
        cancelText="Dismiss"
      >
        You have an unfinished interview in progress.  
        Would you like to continue where you left off?
      </Modal>
    </Layout>
  )
}
