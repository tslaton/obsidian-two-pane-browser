// Libraries
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../plugin/store'

export const isSelectedByPathSlice = createSlice({
  name: 'isSelectedByPath',
  initialState: {} as Record<string, boolean>,
  reducers: {
    toggleIsSelectedByPath: (state, action: PayloadAction<string>) => {
      const path = action.payload
      const isSelected = !!state[path]
      state[path] = !isSelected
    },
    selectPath: (state, action: PayloadAction<string>) => {
      const path = action.payload
      for (let otherPath of Object.keys(state)) {
        state[otherPath] = false
      }
      state[path] = true
    },
  },
})

export const { toggleIsSelectedByPath, selectPath } = isSelectedByPathSlice.actions

export const selectIsSelectedByPath = (state: RootState) => state.isSelectedByPath

export default isSelectedByPathSlice.reducer
