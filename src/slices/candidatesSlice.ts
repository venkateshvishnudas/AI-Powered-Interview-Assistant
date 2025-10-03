import { createSlice, nanoid, PayloadAction, createSelector } from "@reduxjs/toolkit"

export type Candidate = {
  id: string
  name: string
  email: string
  phone: string
  score: number
  summary: string
  chat: { role: "system" | "user" | "assistant"; text: string; ts: string }[]
  qas: {
    question: string
    answer?: string // ✅ optional
    difficulty: "easy" | "medium" | "hard"
    score?: number  // ✅ optional
  }[]
  createdAt: string
}

export interface CandidatesState {
  list: Candidate[]
  search: string
  sortBy: "score" | "createdAt" | "name"
  sortDir: "asc" | "desc"
}

const initialState: CandidatesState = {
  list: [],
  search: "",
  sortBy: "score",
  sortDir: "desc",
}

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate(
      state,
      action: PayloadAction<Omit<Candidate, "id" | "createdAt"> & { id?: string }>
    ) {
      const id = action.payload.id ?? nanoid()
      state.list.push({
        ...action.payload,
        id,
        createdAt: new Date().toISOString(),
      })
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setSort(
      state,
      action: PayloadAction<{
        by: CandidatesState["sortBy"]
        dir?: CandidatesState["sortDir"]
      }>
    ) {
      state.sortBy = action.payload.by
      if (action.payload.dir) state.sortDir = action.payload.dir
    },
  },
})

export const { addCandidate, setSearch, setSort } = candidatesSlice.actions
export default candidatesSlice.reducer

// Selector for filtered & sorted candidates
export const selectFilteredSorted = createSelector(
  (s: { candidates: CandidatesState }) => s.candidates,
  (c) => {
    const search = c.search.toLowerCase()
    const filtered = c.list.filter(
      (x) =>
        x.name.toLowerCase().includes(search) ||
        x.email.toLowerCase().includes(search) ||
        x.phone.includes(search) ||
        x.summary.toLowerCase().includes(search)
    )
    const sorted = [...filtered].sort((a, b) => {
      const dir = c.sortDir === "asc" ? 1 : -1
      if (c.sortBy === "score") return (a.score - b.score) * dir
      if (c.sortBy === "name") return a.name.localeCompare(b.name) * dir
      return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * dir
    })
    return sorted
  }
)
