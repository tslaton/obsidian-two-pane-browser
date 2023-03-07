// Libraries
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectFilesInScope } from '../files/filesSlice'
import { 
  TwoPaneBrowserSettings, loadSettings,
  TagCategory, selectTagCategories,
} from '../settings/settingsSlice'
import { isSubset } from '../../utils'

export interface TagCategoryFilter {
  name: string
  color: string
  isActive: boolean
  size?: number
}

export interface TagFilter {
  name: string
  color?: string
  status?: 'include' | 'exclude' | null
}

export const tagFiltersSlice = createSlice({
  name: 'tagFilters',
  initialState: {
    tagCategoryByTagName: {} as Record<string, TagCategory>,
    activeTagCategoryNames: [] as string[],
    includeTagNames: [] as string[],
    excludeTagNames: [] as string[],
    matchMode: 'all' as 'all' | 'any',
  },
  reducers: {
    toggleTagCategoryFilter(state, action: PayloadAction<string>) {
      const tagCategoryName = action.payload
      const tagCategoryNameIndex = state.activeTagCategoryNames.indexOf(tagCategoryName)
      if (tagCategoryNameIndex === -1) {
        state.activeTagCategoryNames.push(tagCategoryName)
      }
      else {
        state.activeTagCategoryNames.splice(tagCategoryNameIndex, 1)
      }
      // Filter out include/exclude tags not in active categories
      const activeTagCategoryNames = new Set<string>(state.activeTagCategoryNames)
      function isTagInActiveCategory(tagName: string) {
        return activeTagCategoryNames.has(state.tagCategoryByTagName[tagName]?.name)
      }
      if (activeTagCategoryNames.size > 0) {
        state.includeTagNames = state.includeTagNames.filter(isTagInActiveCategory)
        state.excludeTagNames = state.excludeTagNames.filter(isTagInActiveCategory)
      }
    },
    toggleTagFilter(state, action: PayloadAction<string>) {
      const tagName = action.payload
      const includeIndex = state.includeTagNames.indexOf(tagName)
      const excludeIndex = state.excludeTagNames.indexOf(tagName)
      // If it's in includeTagNames, move to excludeTags
      if (includeIndex !== -1) {
        state.includeTagNames.splice(includeIndex, 1)
        state.excludeTagNames.push(tagName)
      }
      // If it's in excludeTagNames, remove it
      else if (excludeIndex !== -1) {
        state.excludeTagNames.splice(excludeIndex, 1)
      }
      // If it was in neither list, put in include list
      else {
        state.includeTagNames.push(tagName)
      }
    },
    reconcileActiveTagCategoryNames(state, action: PayloadAction<string[]>) {
      const tagCategoryNamesInScope = action.payload
      const validNames = new Set(tagCategoryNamesInScope)
      if (!isSubset(state.activeTagCategoryNames, validNames)) {
        state.activeTagCategoryNames = state.activeTagCategoryNames.filter(name => validNames.has(name))
      }
    },
    reconcileFilteredTagNames(state, action: PayloadAction<string[]>) {
      const tagNamesInScope = action.payload
      const validNames = new Set(tagNamesInScope)
      if (!isSubset(state.includeTagNames, validNames)) {
        state.includeTagNames = state.includeTagNames.filter(name => validNames.has(name))
      }
      if (!isSubset(state.excludeTagNames, validNames)) {
        state.excludeTagNames = state.excludeTagNames.filter(name => validNames.has(name))
      }
    },
    clearTagFilters(state) {
      state.activeTagCategoryNames = []
      state.includeTagNames = []
      state.excludeTagNames = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings, (state, action: PayloadAction<TwoPaneBrowserSettings>) => {
        const settings = action.payload
        const tagCategories = settings.tagCategories
        const tagCategoryByTagName: Record<string, TagCategory> = {}
        for (let [_, tagCategory] of Object.entries(tagCategories)) {
          for (let tagName of tagCategory.tagNames) {
            tagCategoryByTagName[tagName] = tagCategory
          }
        }
        state.tagCategoryByTagName = tagCategoryByTagName
      })
  },
})

export const { 
  toggleTagCategoryFilter, toggleTagFilter, 
  reconcileActiveTagCategoryNames, reconcileFilteredTagNames, clearTagFilters, 
} = tagFiltersSlice.actions

export const selectTagNamesInScope = createSelector(
  selectFilesInScope,
  filesInScope => {
    const tagNamesInScope = new Set<string>()
    for (let file of filesInScope) {
      for (let tag of file.tags) {
        tagNamesInScope.add(tag)
      }
    }
    return [...tagNamesInScope].sort((a,b) => a.localeCompare(b))
  }
)

export const selectTagFilters = (state: RootState) => state.tagFilters

export const selectTagCategoryByTagName = createSelector(
  selectTagFilters,
  tagFilters => tagFilters.tagCategoryByTagName
)

export const selectActiveTagCategoryNames = createSelector(
  selectTagFilters,
  tagFilters => tagFilters.activeTagCategoryNames
)

export const selectIncludeTagNames = createSelector(
  selectTagFilters,
  tagFilters => tagFilters.includeTagNames
)

export const selectExcludeTagNames = createSelector(
  selectTagFilters,
  tagFilters => tagFilters.excludeTagNames
)

export const selectAnyTagFiltersAreApplied = createSelector(
  selectActiveTagCategoryNames,
  selectIncludeTagNames,
  selectExcludeTagNames,
  (activeTagCategoryNames, includeTagNames, excludeTagNames) => {
    return (
      activeTagCategoryNames.length > 0 ||
      includeTagNames.length > 0 ||
      excludeTagNames.length > 0
    )
  }
)

export const selectTagFiltersInScope = createSelector(
  selectTagNamesInScope,
  selectActiveTagCategoryNames,
  selectIncludeTagNames,
  selectExcludeTagNames,
  selectTagCategoryByTagName,
  (tagNamesInScope, activeTagCategoryNames, includeTagNames, excludeTagNames, tagCategoryByTagName) => {
    const tagFiltersInScope: TagFilter[] = []
    for (let tagName of tagNamesInScope) {
      const tagCategory = tagCategoryByTagName[tagName] || {}
      if (activeTagCategoryNames.length === 0 || activeTagCategoryNames.indexOf(tagCategory.name) !== -1) {
        let status: 'include' | 'exclude' | null = null
        if (includeTagNames.indexOf(tagName) !== -1) {
          status = 'include'
        }
        else if (excludeTagNames.indexOf(tagName) !== -1) {
          status = 'exclude'
        }
        tagFiltersInScope.push({
          name: tagName,
          color: tagCategoryByTagName[tagName]?.style?.color || 'var(--color-accent)',
          status,
        })
      }
    }
    return tagFiltersInScope
  }
)

export const selectTagCategoryNamesInScope = createSelector(
  selectTagNamesInScope,
  selectTagCategoryByTagName,
  (tagNamesInScope, tagCategoryByTagName) => {
    const tagCategoryNamesInScope = new Set<string>()
    for (let tagName of tagNamesInScope) {
      const tagCategoryName = tagCategoryByTagName[tagName]?.name
      if (tagCategoryName) {
        tagCategoryNamesInScope.add(tagCategoryName)
      }
    }
    return [...tagCategoryNamesInScope].sort((a, b) => a.localeCompare(b))
  }
)

export const selectTagCategoryFiltersInScope = createSelector(
  selectTagCategoryNamesInScope,
  selectActiveTagCategoryNames,
  selectTagCategories,
  (tagCategoryNamesInScope, activeTagCategoryNames, tagCategories) => {
    const tagCategoryFiltersInScope: TagCategoryFilter[] = []
    for (let tagCategoryName of tagCategoryNamesInScope) {
      tagCategoryFiltersInScope.push({
        name: tagCategoryName,
        color: tagCategories[tagCategoryName].style.color,
        isActive: activeTagCategoryNames.indexOf(tagCategoryName) !== -1
      })
    }
    return tagCategoryFiltersInScope
  }
)

export const selectMatchMode = createSelector(
  selectTagFilters,
  tagFilters => tagFilters.matchMode
)

export default tagFiltersSlice.reducer
