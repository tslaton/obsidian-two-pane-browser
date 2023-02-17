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

export interface SelectableFile extends FileMeta {
  isSelected: boolean
}

const filesAdapter = createEntityAdapter<SelectableFile>({
  selectId: file => file.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const filesSlice = createSlice({
  name: 'files',
  initialState: filesAdapter.getInitialState(),
  reducers: {
    loadFiles(state, action: PayloadAction<FileMeta[]>) {
      const selectableFiles = action.payload.map(file => ({...file, isSelected: false}))
      filesAdapter.setAll(state, selectableFiles)
    },
    addFile: filesAdapter.addOne,
    updateFile: filesAdapter.updateOne,
    removeFile: filesAdapter.removeOne,
    selectFile(state, action: PayloadAction<string>) {
      const path = action.payload
      for (let id of state.ids) {
        const file = state.entities[id]
        if (file) {
          file.isSelected = (id === path)
        }
      }
    }
  },
})

export const { loadFiles, addFile, updateFile, removeFile, selectFile } = filesSlice.actions

export const filesSelectors = filesAdapter.getSelectors<RootState>(
  state => state.files
)
export const selectFilesInScope = createSelector(
  filesSelectors.selectAll,
  selectPathsInScope,
  (files, pathsInScope) => files.filter(file => pathsInScope.has(getParentPath(file)))
)

export default filesSlice.reducer
