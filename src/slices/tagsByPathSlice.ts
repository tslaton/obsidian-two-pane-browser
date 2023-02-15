// Libraries
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../store'

export const tagsByPathSlice = createSlice({
  name: 'tagsByPath',
  initialState: {} as Record<string, string[]>,
  reducers: {
    loadTagsByPath: (state, action: PayloadAction<Record<string, string[]>>) => {
      return action.payload
    },
  },
})

export const { loadTagsByPath } = tagsByPathSlice.actions

export const selectTagsByPath = (state: RootState) => state.tagsByPath

export default tagsByPathSlice.reducer
