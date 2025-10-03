import { Table, Input, Select, Button } from 'antd'
import { useAppDispatch, useAppSelector } from '../store'
import { selectFilteredSorted, setSearch, setSort } from '../slices/candidatesSlice'

export default function CandidatesTable({ onOpen }: { onOpen: (id: string) => void }) {
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectFilteredSorted)
  const { search, sortBy, sortDir } = useAppSelector(s => s.candidates)

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Score', dataIndex: 'score' },
    { title: 'Summary', dataIndex: 'summary' },
    {
      title: 'Action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => onOpen(record.id)}>View</Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => dispatch(setSearch(e.target.value))}
          style={{ width: 200 }}
        />
        <Select
          value={`${sortBy}:${sortDir}`}
          onChange={(val) => {
            const [by, dir] = val.split(':') as any
            dispatch(setSort({ by, dir }))
          }}
          style={{ width: 180 }}
          options={[
            { value: 'score:desc', label: 'Score ↓' },
            { value: 'score:asc', label: 'Score ↑' },
            { value: 'createdAt:desc', label: 'Newest' },
            { value: 'createdAt:asc', label: 'Oldest' },
            { value: 'name:asc', label: 'Name A→Z' },
            { value: 'name:desc', label: 'Name Z→A' },
          ]}
        />
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
    </div>
  )
}
