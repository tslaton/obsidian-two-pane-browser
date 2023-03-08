// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectFilesInScope } from '../files/filesSlice'
import { revealTag } from '../tags/extraActions'

interface SearchOption {
  id: string
  name: string
  isActive: boolean
}

export interface SortOption {
  property: 'filename' | 'mtime' | 'ctime'
  direction: 'asc' | 'desc'
}

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    options: [
      { id: 'show-search', name: 'Show Search', isActive: false },
      { id: 'show-tag-filters', name: 'Show Tag Filters', isActive: false },
    ] as SearchOption[],
    sort: { property: 'mtime', direction: 'desc' } as SortOption,
  },
  reducers: {
    updateSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload
    },
    toggleSearchOption(state, action: PayloadAction<string>) {
      const id = action.payload
      const option = state.options.find(option => option.id === id)
      if (option) {
        option.isActive = !option.isActive
      }
    },
    setSortOption(state, action: PayloadAction<SortOption>) {
      state.sort = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(revealTag, (state) => {
        state.options[0].isActive = true
        state.options[1].isActive = true
      })
  },
})

export const { updateSearchQuery, toggleSearchOption, setSortOption } = searchSlice.actions

export const selectSearchQuery = (state: RootState) => state.search.query

export const selectSearchOptions = (state: RootState) => state.search.options

export const selectActiveSearchOptions = createSelector(
  selectSearchOptions,
  options => options.filter(option => option.isActive === true)
)

export const selectSortOption = (state: RootState) => state.search.sort

export const selectSortedFilesInScope = createSelector(
  selectFilesInScope,
  selectSortOption,
  (filesInScope, sortOption) => {
    return filesInScope.slice().sort((a, b) => {
      const direction = sortOption.direction === 'asc' ? 1 : -1
      if (sortOption.property === 'filename') {
        return direction * a.name.localeCompare(b.name)
      }
      else if (sortOption.property === 'mtime') {
        return direction * (a.stat.mtime - b.stat.mtime)
      }
      else if (sortOption.property === 'ctime') {
        return direction * (a.stat.ctime - b.stat.ctime)
      }
      else {
        return 0
      }
    })
  }
)

export default searchSlice.reducer
