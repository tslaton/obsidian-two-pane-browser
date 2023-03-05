// Libraries
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

export interface TagCategoryFilter {
  name: string
  isActive: boolean
}

const tagCategoryFiltersAdapter = createEntityAdapter<TagCategoryFilter>({
  selectId: tagCategoryFilter => tagCategoryFilter.name,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const tagCategoryFiltersSlice = createSlice({
  name: 'tagCategoryFilters',
  initialState: tagCategoryFiltersAdapter.getInitialState(),
  reducers: {
    loadTagCategories(state, action: PayloadAction<string[]>) {
      const tagCategoryFilters = action.payload.map(tc => 
        ({ name: tc, isActive: false })
      )
      tagCategoryFiltersAdapter.setAll(state, tagCategoryFilters)
    },
    toggleTagCategoryFilter(state, action: PayloadAction<string>) {
      const tagCategoryFilter = state.entities[action.payload]!
      tagCategoryFilter.isActive = !tagCategoryFilter.isActive
    },
    clearTagCategoryFilters(state) {
      for (const [_, tagCategoryFilter] of Object.entries(state.entities)) {
        tagCategoryFilter!.isActive = false
      }
    },
  },
})

export const { loadTagCategories, toggleTagCategoryFilter, clearTagCategoryFilters } = tagCategoryFiltersSlice.actions

export const tagCategoryFiltersSelectors = tagCategoryFiltersAdapter.getSelectors<RootState>(
  state => state.tagCategoryFilters
)

export const selectActiveTagCategoryFilters = createSelector(
  tagCategoryFiltersSelectors.selectAll,
  tagCategoryFilters => tagCategoryFilters.filter(tc => tc.isActive)
)

export default tagCategoryFiltersSlice.reducer
