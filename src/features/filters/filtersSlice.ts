// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

export interface FilterMeta {
  id: string
  name: string
  isActive: boolean
}

export const filtersSlice = createSlice({
  name: 'filters',
  initialState: [
    { id: 'all', name: 'All', isActive: true },
    { id: 'inbox', name: 'Inbox', isActive: false },
    { id: 'recents', name: 'Last 7 days', isActive: false },
  ] as FilterMeta[],
  reducers: {
    activateFilter(state, action: PayloadAction<string>) {
      const id = action.payload
      for (let filter of state) {
        filter.isActive = filter.id === id
      }
    },
    deactivateAllFilters(state) {
      for (let filter of state) {
        filter.isActive = false
      }
    },
  },
})

export const { activateFilter, deactivateAllFilters } = filtersSlice.actions

export const selectFilters = (state: RootState) => state.filters

export const selectActiveFilter = createSelector(
  selectFilters,
  filters => filters.find(filter => filter.isActive === true)
)

export default filtersSlice.reducer
