// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { TagStyle, tagStyles } from '../../common/styles'

export const DEFAULT_SETTINGS = {
  tagsByStyleName: Object.fromEntries(
    Object.keys(tagStyles).map(styleName => [styleName, ''])
  ),
}

export type TwoPaneBrowserSettings = typeof DEFAULT_SETTINGS

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
export const selectStylesByTag = createSelector(
  selectSettings,
  settings => {
    const stylesByTag: Record<string, TagStyle> = {}
    for (let [styleName, tagsAsString] of Object.entries(settings.tagsByStyleName)) {
      let tags = tagsAsString.split(' ')
      // do a small amount of cleaning so we have valid tags
      tags = tags.map(tag => tag.trim()).filter(tag => tag.startsWith('#'))
      for (let tag of tags) {
        // @ts-ignore
        stylesByTag[tag] = tagStyles[styleName] || tagStyles.gray
      }
    }
  }
)

export default settingsSlice.reducer
