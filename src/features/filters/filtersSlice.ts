// Libraries
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

export const filtersSlice = createSlice({
  name: 'filters',
  initialState: [
    { id: 'all', name: 'All', isSelected: false },
    { id: 'recents', name: 'Recently modified', isSelected: false },
  ],
  reducers: {
    selectFilter(state, action: PayloadAction<string>) {
      const id = action.payload
      for (let filter of state) {
        filter.isSelected = filter.id === id
      }
    },
  },
})

export const { selectFilter } = filtersSlice.actions

export const selectFilters = (state: RootState) => state.filters

export default filtersSlice.reducer
