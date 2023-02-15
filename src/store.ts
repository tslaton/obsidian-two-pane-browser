// Libraries
import { createSelector } from 'reselect'
import { configureStore } from '@reduxjs/toolkit'
// Modules
import { recurseChildren } from './utils'
import folderTreeReducer, { selectFolderTree, FileMeta } from './slices/folderTreeSlice'
import isOpenByPathReducer, { selectIsOpenByPath } from './slices/isOpenByPathSlice'
import isSelectedByPathReducer, { selectIsSelectedByPath } from './slices/isSelectedByPathSlice'

export const selectTopLevelFolders = createSelector(
  selectFolderTree,
  (folderTree) => folderTree ? folderTree.children : []
)
export const selectFilesInScope = createSelector(
  selectFolderTree,
  selectIsSelectedByPath,
  (folderTree, isSelectedByPath) => {
    const filesInScope: FileMeta[] = []
    recurseChildren(folderTree, f => {
      if (isSelectedByPath[f.path]) {
        filesInScope.push(...f.files)
      }
    })
    return filesInScope
  }
)

const store = configureStore({
  reducer: {
    folderTree: folderTreeReducer,
    isOpenByPath: isOpenByPathReducer,
    isSelectedByPath: isSelectedByPathReducer,
  },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
