// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

// CSS props to values... for now, just color
export type TagCategoryStyle = Record<string,string>

export interface TagCategoryMeta {
  name: string
  style: TagCategoryStyle
  tags: string[]
}

export interface TwoPaneBrowserSettings {
  tagCategories: Record<string, TagCategoryMeta>
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

export const selectTagCategoryMetaByTag = createSelector(
  selectTagCategories,
  tagCategories => {
    const tagCategoryMetaByTag: Record<string, TagCategoryMeta> = {}
    for (let [_, categoryMeta] of Object.entries(tagCategories)) {
      for (let tag of categoryMeta.tags) {
        tagCategoryMetaByTag[tag] = categoryMeta
      }
    }
    return tagCategoryMetaByTag
  }
)

export default settingsSlice.reducer
