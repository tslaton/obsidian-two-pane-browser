// Libraries
import { createSelector } from 'reselect'
import { configureStore } from '@reduxjs/toolkit'
// Modules
import { recurseChildren } from '../common/utils'
import settingsReducer from '../features/settings/settingsSlice'
import foldersReducer from '../features/folders/foldersSlice'
import filesReducer from '../features/files/filesSlice'
import folderTreeReducer, { selectFolderTree, FileMeta } from '../slices/folderTreeSlice'
import isOpenByPathReducer, { selectIsOpenByPath } from '../slices/isOpenByPathSlice'
import isSelectedByPathReducer, { selectIsSelectedByPath } from '../slices/isSelectedByPathSlice'
import filePreviewsByPathReducer from '../slices/filePreviewsByPathSlice'
import tagsByPathReducer from '../slices/tagsByPathSlice'

export const selectTopLevelFolders = createSelector(
  selectFolderTree,
  (folderTree) => folderTree ? folderTree.children : []
)
export const selectFilesInScope = createSelector(
  selectFolderTree,
  selectIsSelectedByPath,
  (folderTree, isSelectedByPath) => {
    const filesInScope: Set<FileMeta> = new Set()
    recurseChildren(folderTree, f => {
      if (isSelectedByPath[f.path]) {
        for (let file of f.files) {
          filesInScope.add(file)
        }
        // if none of f's children are selected, consider all of them selected with f     
        let hasSelectedChildren = false
        for (let child of f.children) {
         if (isSelectedByPath[child.path]) {
           hasSelectedChildren = true
           break
          }
        }
        if (!hasSelectedChildren) {
          for (let child of f.children) {
            for (let file of child.files) {
              filesInScope.add(file)
            }
          }
        }
      }
    })
    return [...filesInScope].sort((a, b) => a.name.localeCompare(b.name))
  }
)

const store = configureStore({
  reducer: {
    settings: settingsReducer,
    folders: foldersReducer,
    files: filesReducer,
    folderTree: folderTreeReducer,
    isOpenByPath: isOpenByPathReducer,
    isSelectedByPath: isSelectedByPathReducer,
    filePreviewsByPath: filePreviewsByPathReducer,
    tagsByPath: tagsByPathReducer,
  },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
