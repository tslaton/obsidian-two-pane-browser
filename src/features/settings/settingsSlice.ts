// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

export interface TagCategory {
  name: string
  style: Record<string,string>
  tagNames: string[]
}

export interface TwoPaneBrowserSettings {
  tagCategories: Record<string, TagCategory>
}

export const DEFAULT_SETTINGS = {
  tagCategories: {},
} as TwoPaneBrowserSettings

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: DEFAULT_SETTINGS,
  reducers: {
    loadSettings: (_, action: PayloadAction<TwoPaneBrowserSettings>) => {
      return action.payload
    },
  },
})

export const { loadSettings } = settingsSlice.actions

export const selectSettings = (state: RootState) => state.settings

export const selectTagCategories = createSelector(
  selectSettings,
  settings => settings.tagCategories
)

export default settingsSlice.reducer
