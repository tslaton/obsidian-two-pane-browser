// Libraries
import { FileStats } from 'obsidian'
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectPathsInScope } from '../folders/foldersSlice'
import { getParentPath } from '../../utils'

export interface FileMeta {
  name: string
  path: string
  stat: FileStats
  preview: string
  tags: string[]
}

const filesAdapter = createEntityAdapter<FileMeta>({
  selectId: file => file.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const filesSlice = createSlice({
  name: 'files',
  initialState: filesAdapter.getInitialState(),
  reducers: {
    loadFiles(state, action: PayloadAction<FileMeta[]>) {
      filesAdapter.setAll(state, action.payload)
    },
    addFile: filesAdapter.addOne,
    updateFile: filesAdapter.updateOne,
    removeFile: filesAdapter.removeOne,
  },
})

export const { loadFiles, addFile, updateFile, removeFile } = filesSlice.actions

export const filesSelectors = filesAdapter.getSelectors<RootState>(
  state => state.files
)
export const selectFilesInScope = createSelector(
  filesSelectors.selectAll,
  selectPathsInScope,
  (files, pathsInScope) => files.filter(file => pathsInScope.has(getParentPath(file)))
)

export default filesSlice.reducer
