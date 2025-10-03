import { Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { parseResume } from '../utils/parseResume'
import { useAppDispatch, useAppSelector } from '../store'
import { setParsed, setError, startParsing } from '../slices/resumeSlice'

const { Dragger } = Upload

export default function ResumeUpload() {
  const dispatch = useAppDispatch()
  const { status, fileName, fields, missing, error } = useAppSelector(s => s.resume)

  const props = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.docx',
    beforeUpload: async (file: File) => {
      dispatch(startParsing({ fileName: file.name }))
      try {
        const parsed = await parseResume(file)
        dispatch(setParsed({ fields: parsed }))
        message.success(`${file.name} parsed successfully`)
      } catch (err: any) {
        dispatch(setError(err?.message ?? 'Failed to parse resume'))
        message.error('Resume parsing failed')
      }
      return false
    },
  }

  return (
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Click or drag resume file here to upload</p>
        <p className="ant-upload-hint">PDF required, DOCX optional</p>
      </Dragger>
      {status === 'parsed' && (
        <ul style={{ marginTop: 12 }}>
          <li>Name: {fields.name ?? <em>missing</em>}</li>
          <li>Email: {fields.email ?? <em>missing</em>}</li>
          <li>Phone: {fields.phone ?? <em>missing</em>}</li>
        </ul>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
