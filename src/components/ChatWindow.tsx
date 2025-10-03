import { List } from 'antd'

export type ChatMsg = { role: 'system' | 'assistant' | 'user'; text: string }

export default function ChatWindow({ messages }: { messages: ChatMsg[] }) {
  return (
    <List
      bordered
      size="small"
      dataSource={messages}
      renderItem={(m) => (
        <List.Item style={{ background: m.role === 'user' ? '#e6f7ff' : '#fafafa' }}>
          <div>
            <b>{m.role.toUpperCase()}:</b> {m.text}
          </div>
        </List.Item>
      )}
      style={{ height: 300, overflowY: 'auto' }}
    />
  )
}
