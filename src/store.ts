import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux"
import storage from "redux-persist/lib/storage"
import { persistReducer, persistStore } from "redux-persist"

import resumeReducer from "./slices/resumeSlice"
import interviewReducer from "./slices/interviewSlice"
import candidatesReducer from "./slices/candidatesSlice"

const rootReducer = combineReducers({
  resume: resumeReducer,
  interview: interviewReducer,
  candidates: candidatesReducer,
})

const persistConfig = {
  key: "root",
  storage,
  version: 1,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer, // ✅ no weird casting
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ required for redux-persist
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
