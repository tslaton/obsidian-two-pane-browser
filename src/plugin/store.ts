// Libraries
import { configureStore } from '@reduxjs/toolkit'
// Modules
import settingsReducer from '../features/settings/settingsSlice'
import foldersReducer from '../features/folders/foldersSlice'
import filesReducer from '../features/files/filesSlice'

const store = configureStore({
  reducer: {
    settings: settingsReducer,
    folders: foldersReducer,
    files: filesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
