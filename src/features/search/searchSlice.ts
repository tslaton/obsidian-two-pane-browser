// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { InteractiveFile, selectFilesInScope } from '../files/filesSlice'
import { revealTag } from '../tags/extraActions'
import { requestSearchResults, fulfillSearchResults, failSearchResults } from './extraActions'

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
    resultsInfo: {
      status: null as resultsStatus,
      error: null as string | null,
    },
  },
  reducers: {
    updateSearchQuery(state, action: PayloadAction<string>) {
      const query = action.payload
      state.query = query
      if (query === '') {
        state.resultsInfo = {
          status: null,
          error: null,
        }
      }
    },
    clearSearchQuery(state) {
      state.query = ''
      state.resultsInfo = {
        status: null,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(revealTag, (state) => {
        state.options.showSearch.isActive = true
        state.options.showTagFilters.isActive = true
      })
      .addCase(requestSearchResults, (state) => {
        state.resultsInfo = {
          status: 'requested',
          error: null,
        }
      })
      .addCase(fulfillSearchResults, (state) => {
        state.resultsInfo = {
          status: 'fulfilled',
          error: null,
        }
      })
      .addCase(failSearchResults, (state, action: PayloadAction<string>) => {
        state.resultsInfo = {
          status: 'failed',
          error: action.payload,
        }
      })
  },
})

export const { 
  updateSearchQuery, clearSearchQuery, setSearchInputHasFocus,
  toggleShowSearch, toggleShowTagFilters, toggleMatchCase, setSortOption,
} = searchSlice.actions

export const selectSearchQuery = (state: RootState) => state.search.query

export const selectSearchInputHasFocus = (state: RootState) => state.search.searchInputHasFocus

export const selectSearchOptions = (state: RootState) => state.search.options

export const selectSearchResultsInfo = (state: RootState) => state.search.resultsInfo

export const selectSortOption = (state: RootState) => state.search.sort

export const selectSearchResults = (state: RootState) => state.search.resultsInfo

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
  selectSearchResultsInfo,
  (sortedFilesInScope, searchResultsInfo) => {
    if (searchResultsInfo.status === 'fulfilled') {
      const queriedFilesInScope: InteractiveFile[] = sortedFilesInScope.filter(file => file.searchResults?.score)
      return queriedFilesInScope.sort((a, b) => b.searchResults!.score - a.searchResults!.score)
    }
    else {
      return sortedFilesInScope
    }
  }
)

export default searchSlice.reducer
