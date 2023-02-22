// Libraries
import { createSelector } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectFilesInScope } from '../files/filesSlice'

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
