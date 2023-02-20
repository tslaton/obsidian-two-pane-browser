// Libraries
import { configureStore } from '@reduxjs/toolkit'
// Modules
import settingsReducer from '../features/settings/settingsSlice'
import foldersReducer from '../features/folders/foldersSlice'
import filesReducer from '../features/files/filesSlice'
import filtersReducer from '../features/filters/filtersSlice'
import togglesReducer from '../features/toggles/togglesSlice'
import searchReducer from '../features/search/searchSlice'

const store = configureStore({
  reducer: {
    settings: settingsReducer,
    folders: foldersReducer,
    files: filesReducer,
    filters: filtersReducer,
    toggles: togglesReducer,
    search: searchReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
