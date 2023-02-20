// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

interface SearchOption {
  id: string
  name: string
  isActive: boolean
}

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    options: [
      { id: 'show-search', name: 'Show Search', isActive: false },
      { id: 'show-tags', name: 'Show Tags', isActive: false },
    ] as SearchOption[]
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
  },
})

export const { updateSearchQuery, toggleSearchOption } = searchSlice.actions

export const selectSearchQuery = (state: RootState) => state.search.query
export const selectionSearchOptions = (state: RootState) => state.search.options
export const selectActiveSearchOptions = createSelector(
  selectionSearchOptions,
  options => options.filter(option => option.isActive === true)
)

export default searchSlice.reducer
