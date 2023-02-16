// Libraries
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../plugin/store'

export const isOpenByPathSlice = createSlice({
  name: 'isOpenByPath',
  initialState: {} as Record<string, boolean>,
  reducers: {
    toggleIsOpenByPath: (state, action: PayloadAction<string>) => {
      const path = action.payload
      const isOpen = !!state[path]
      state[path] = !isOpen
    },
  },
})

export const { toggleIsOpenByPath } = isOpenByPathSlice.actions

export const selectIsOpenByPath = (state: RootState) => state.isOpenByPath

export default isOpenByPathSlice.reducer
