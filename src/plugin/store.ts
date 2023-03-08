// Libraries
import { configureStore } from '@reduxjs/toolkit'
// Modules
import settingsReducer from '../features/settings/settingsSlice'
import foldersReducer from '../features/folders/foldersSlice'
import filesReducer from '../features/files/filesSlice'
import filtersReducer from '../features/filters/filtersSlice'
import searchReducer from '../features/search/searchSlice'
import tagFiltersReducer from '../features/tags/tagFiltersSlice'

const store = configureStore({
  reducer: {
    settings: settingsReducer,
    folders: foldersReducer,
    files: filesReducer,
    filters: filtersReducer,
    search: searchReducer,
    tagFilters: tagFiltersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
