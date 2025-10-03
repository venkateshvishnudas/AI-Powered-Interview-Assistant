import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ResumeFields = {
  name?: string
  email?: string
  phone?: string
}

export interface ResumeState {
  fullText: string
  fileName?: string
  fields: ResumeFields
  missing: ('name' | 'email' | 'phone')[]
  status: 'idle' | 'parsing' | 'parsed' | 'error'
  error?: string
}

const initialState: ResumeState = {
  fields: {},
  missing: ['name', 'email', 'phone'],
  status: 'idle',
  fullText: ''
}

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    startParsing(state, action: PayloadAction<{ fileName: string }>) {
      state.status = 'parsing'
      state.fileName = action.payload.fileName
      state.error = undefined
    },
    setParsed(state, action: PayloadAction<{ fields: ResumeFields }>) {
      state.status = 'parsed'
      state.fields = action.payload.fields

      const missing: ('name' | 'email' | 'phone')[] = []
      if (!state.fields.name) missing.push('name')
      if (!state.fields.email) missing.push('email')
      if (!state.fields.phone) missing.push('phone')
      state.missing = missing
    },
    setError(state, action: PayloadAction<string>) {
      state.status = 'error'
      state.error = action.payload
    },
    setField(state, action: PayloadAction<{ key: keyof ResumeFields; value: string }>) {
      state.fields[action.payload.key] = action.payload.value
      const idx = state.missing.indexOf(action.payload.key as any)
      if (idx >= 0) state.missing.splice(idx, 1)
    },
    resetResume() {
      return initialState
    },
  },
})

export const { startParsing, setParsed, setError, setField, resetResume } = resumeSlice.actions
export default resumeSlice.reducer
