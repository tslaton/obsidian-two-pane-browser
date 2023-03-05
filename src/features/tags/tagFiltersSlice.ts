// Libraries
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectFilesInScope } from '../files/filesSlice'
import { selectTagCategoryMetaByTag } from '../settings/settingsSlice'
import { tagCategoryFiltersSelectors, selectActiveTagCategoryFilters } from './tagCategoryFiltersSlice'

export interface TagFilter {
  name: string
  // Generic three states: 'apply' | 'negate' | 'off'
  status: 'include' | 'exclude' | null
}

const tagFiltersAdapter = createEntityAdapter<TagFilter>({
  selectId: tagFilter => tagFilter.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const tagFiltersSlice = createSlice({
  name: 'tagFilters',
  initialState: tagFiltersAdapter.getInitialState(),
  reducers: {
    loadTags(state, action: PayloadAction<string[]>) {
      const tagFilters = action.payload.map(tag =>
        ({ name: tag, status: null })  
      )
      tagFiltersAdapter.setAll(state, tagFilters)
    },
    toggleTagFilter(state, action: PayloadAction<string>) {
      const tagFilter = state.entities[action.payload]!
      tagFilter.status = tagFilter.status === null
        ? 'include'
        : tagFilter.status === 'include'
          ? 'exclude'
          : null
    },
    clearTagFilters(state) {
      for (const [_, tagFilter] of Object.entries(state.entities)) {
        tagFilter!.status = null
      }
    },
  },
})

export const { loadTags, toggleTagFilter, clearTagFilters } = tagFiltersSlice.actions

export const tagFiltersSelectors = tagFiltersAdapter.getSelectors<RootState>(
  state => state.tagFilters
)

export const selectTagsInScope = createSelector(
  selectFilesInScope,
  filesInScope => {
    const tagsInScope = new Set<string>()
    for (let file of filesInScope) {
      for (let tag of file.tags) {
        tagsInScope.add(tag)
      }
    }
    return tagsInScope
  }
)

export const selectTagFiltersInScope = createSelector(
  selectTagsInScope,
  tagFiltersSelectors.selectAll,
  (tagsInScope, tagFilters) => tagFilters.filter(tf => tagsInScope.has(tf.name))
)

// Ideally not in this file...
export const selectVisibleTagCategoryFilters = createSelector(
  tagCategoryFiltersSelectors.selectAll,
  selectTagFiltersInScope,
  selectTagCategoryMetaByTag,
  (tagCategoryFilters, tagFiltersInScope, tagCategoryMetaByTag) => {
    const visibleTagCategoryNames = new Set<string>()
    for (let tagFilter of tagFiltersInScope) {
      const tagCategoryName = tagCategoryMetaByTag[tagFilter.name]?.name || 'none'
      visibleTagCategoryNames.add(tagCategoryName)
    }
    return visibleTagCategoryNames.size > 1
      ? tagCategoryFilters.filter(tcf => visibleTagCategoryNames.has(tcf.name))
      : []
  }
)

export const selectVisibleTagFilters = createSelector(
  selectTagFiltersInScope,
  selectActiveTagCategoryFilters,
  selectTagCategoryMetaByTag,
  (tagFiltersInScope, activeTagCategoryFilters, tagCategoryMetaByTag) => {
    const activeTagCategoryFilterNames = new Set<string>()
    for (let tagCategoryFilter of activeTagCategoryFilters) {
      activeTagCategoryFilterNames.add(tagCategoryFilter.name)
    }
    return activeTagCategoryFilterNames.size > 0
      ? tagFiltersInScope.filter(tf => activeTagCategoryFilterNames.has(tagCategoryMetaByTag[tf.name]?.name))
      : tagFiltersInScope
  }
)

export const selectActiveTagFilters = createSelector(
  tagFiltersSelectors.selectAll,
  tagFilters => tagFilters.filter(tf => tf.status !== null)
)

export const selectAnyTagFiltersAreApplied = createSelector(
  selectActiveTagCategoryFilters,
  selectActiveTagFilters,
  (activeTagCategoryFilters, activeTagFilters) => {
    return activeTagCategoryFilters.length > 0 || activeTagFilters.length > 0
  }
)

export default tagFiltersSlice.reducer
