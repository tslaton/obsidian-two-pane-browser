// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

// TODO: Move all of the "toggle" and "buttonbar" stuff into search
// NOTE: Currently identical to FilterMeta if isSelected === isActive
export interface ToggleMeta {
  id: string
  name: string
  isActive: boolean
}

export const togglesSlice = createSlice({
  name: 'toggles',
  initialState: [
    { id: 'show-search', name: 'Show Search', isActive: false },
    { id: 'show-tags', name: 'Show Tags', isActive: false },
  ] as ToggleMeta[],
  reducers: {
    // TODO: Change selectSelected, filterFilter, toggleToggle, etc.?
    toggleToggle(state, action: PayloadAction<string>) {
      const id = action.payload
      const toggle = state.find(toggle => toggle.id === id)
      if (toggle) {
        toggle.isActive = !toggle.isActive
      }
    },
  },
})

export const { toggleToggle } = togglesSlice.actions

export const selectToggles = (state: RootState) => state.toggles

export const selectActiveToggles = createSelector(
  selectToggles,
  toggles => toggles.filter(toggle => toggle.isActive === true)
)

export default togglesSlice.reducer
