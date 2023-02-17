// Libraries
import { FileStats } from 'obsidian'
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectFoldersInScope } from '../folders/foldersSlice'
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
  selectFoldersInScope,
  (files, foldersInScope) => {
    console.log('selectFilesInScope called: ', files, foldersInScope)
    // TODO: actually this isn't fully correct logic - eg., notes selection doesn't grab notes/ai
    // TODO: cut out the middle man here?
    const pathsInScope = new Set(foldersInScope.map(folder => folder.path))
    const filteredFiles = files.filter(file => pathsInScope.has(getParentPath(file.name, file.path)))
    return filteredFiles
  } 
)

export default filesSlice.reducer
