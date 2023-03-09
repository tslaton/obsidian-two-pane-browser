// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectFilesInScope } from '../files/filesSlice'
import { revealTag } from '../tags/extraActions'

// Search recipe (credit to liam on Discord)
// The fuzzySearch function has nothing to do with files, it just lets you fuzzy search for strings. 
// You'll need to iterate through the files yourself. A basic approach would be:

// - get all files
// - get query from some input element
// - prepare fuzzy search using input value
// - filter files by fuzzy search result
// - sort list of files by SearchResult.score

// Ref: https://discord.com/channels/686053708261228577/840286264964022302/1078375455826120895
export interface SortOption {
  property: 'filename' | 'mtime' | 'ctime'
  direction: 'asc' | 'desc'
}

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    options: {
      showSearch: { name: 'Show Search', isActive: false },
      showTagFilters: { name: 'Show Tag Filters', isActive: false },
      matchCase: { name: 'Match Case', isActive: false },
    },
    sort: { property: 'mtime', direction: 'desc' } as SortOption,
  },
  reducers: {
    updateSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload
    },
    clearSearchQuery(state) {
      state.query = ''
    },
    toggleShowSearch(state) {
      state.options.showSearch.isActive = !state.options.showSearch.isActive
    },
    toggleShowTagFilters(state) {
      state.options.showTagFilters.isActive = !state.options.showTagFilters.isActive
    },
    toggleMatchCase(state) {
      state.options.matchCase.isActive = !state.options.matchCase.isActive
    },
    setSortOption(state, action: PayloadAction<SortOption>) {
      state.sort = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(revealTag, (state) => {
        state.options.showSearch.isActive = true
        state.options.showTagFilters.isActive = true
      })
  },
})

export const { 
  updateSearchQuery, clearSearchQuery,
  toggleShowSearch, toggleShowTagFilters, toggleMatchCase, setSortOption, 
} = searchSlice.actions

export const selectSearchQuery = (state: RootState) => state.search.query

export const selectSearchOptions = (state: RootState) => state.search.options

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
