// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { FileMeta, InteractiveFile, selectFilesInScope } from '../files/filesSlice'
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

type resultsStatus = 'requested' | 'fulfilled' | 'failed' | null 

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    searchInputHasFocus: false,
    options: {
      showSearch: { name: 'Show Search', isActive: false },
      showTagFilters: { name: 'Show Tag Filters', isActive: false },
      matchCase: { name: 'Match Case', isActive: false },
    },
    sort: { property: 'mtime', direction: 'desc' } as SortOption,
    results: {
      status: null as resultsStatus,
      files: [] as InteractiveFile[],
      error: null as string | null,
    },
  },
  reducers: {
    updateSearchQuery(state, action: PayloadAction<string>) {
      const query = action.payload
      state.query = query
      if (query === '') {
        state.results = {
          status: null,
          files: [],
          error: null,
        }
      }
    },
    clearSearchQuery(state) {
      state.query = ''
      state.results = {
        status: null,
        files: [],
        error: null,
      }
    },
    setSearchInputHasFocus(state, action: PayloadAction<boolean>) {
      state.searchInputHasFocus = action.payload
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
    // TODO: Refactor as asyncThunk; for now plugin will direct this cycle
    requestSearchResults(state) {
      state.results = {
        status: 'requested',
        files: [],
        error: null,
      }
    },
    fulfillSearchResults(state, action: PayloadAction<FileMeta[]>) {
      const files: InteractiveFile[] = action.payload.map(f => ({
        ...f, isActive: false, isSelected: false, isAwaitingRename: false,
      }))
      state.results = {
        status: 'fulfilled',
        files,
        error: null,
      }
    },
    failSearchResults(state, action: PayloadAction<string>) {
      const error = action.payload
      state.results = {
        status: 'failed',
        files: [],
        error,
      }
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
  updateSearchQuery, clearSearchQuery, setSearchInputHasFocus,
  toggleShowSearch, toggleShowTagFilters, toggleMatchCase, setSortOption,
  requestSearchResults, fulfillSearchResults, failSearchResults,
} = searchSlice.actions

export const selectSearchQuery = (state: RootState) => state.search.query

export const selectSearchInputHasFocus = (state: RootState) => state.search.searchInputHasFocus

export const selectSearchOptions = (state: RootState) => state.search.options

export const selectSortOption = (state: RootState) => state.search.sort

export const selectSearchResults = (state: RootState) => state.search.results

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

export const selectQueriedFilesInScope = createSelector(
  selectSortedFilesInScope,
  selectSearchResults,
  (sortedFilesInScope, searchResults) => searchResults.files.length > 0 
    ? searchResults.files
    : sortedFilesInScope
)

export default searchSlice.reducer
