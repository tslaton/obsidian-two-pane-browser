// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

export const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
  },
  reducers: {
    updateQuery(state, action: PayloadAction<string>) {
      state.query = action.payload
    },
  },
})

export const { updateQuery } = searchSlice.actions

export const selectQuery = (state: RootState) => state.search.query

export default searchSlice.reducer
