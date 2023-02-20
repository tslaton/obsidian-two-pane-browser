// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

export interface FilterMeta {
  id: string
  name: string
  isSelected: boolean
}

export const filtersSlice = createSlice({
  name: 'filters',
  initialState: [
    { id: 'all', name: 'All', isSelected: true },
    { id: 'inbox', name: 'Inbox', isSelected: false },
    { id: 'recents', name: 'Recently modified', isSelected: false },
  ] as FilterMeta[],
  reducers: {
    selectFilter(state, action: PayloadAction<string>) {
      const id = action.payload
      for (let filter of state) {
        filter.isSelected = filter.id === id
      }
    },
    deselectAllFilters(state) {
      for (let filter of state) {
        filter.isSelected = false
      }
    },
  },
})

export const { selectFilter, deselectAllFilters } = filtersSlice.actions

export const selectFilters = (state: RootState) => state.filters

export const selectSelectedFilter = createSelector(
  selectFilters,
  filters => filters.find(filter => filter.isSelected === true)
)

export default filtersSlice.reducer
