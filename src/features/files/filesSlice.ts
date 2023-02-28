// Libraries
import { FileStats, moment } from 'obsidian'
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectPathsInScope } from '../folders/foldersSlice'
import { selectActiveFilter } from '../filters/filtersSlice'
import { getParentPath } from '../../utils'

export interface FileMeta {
  name: string
  path: string
  stat: FileStats
  preview: string
  tags: string[]
}

export interface InteractiveFile extends FileMeta {
  isActive: boolean
  isSelected: boolean
  isAwaitingRename: boolean
}

const filesAdapter = createEntityAdapter<InteractiveFile>({
  selectId: file => file.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const filesSlice = createSlice({
  name: 'files',
  initialState: filesAdapter.getInitialState(),
  reducers: {
    loadFiles(state, action: PayloadAction<FileMeta[]>) {
      const interactiveFiles = action.payload.map(file => 
        ({...file, isActive: false, isSelected: false, isAwaitingRename: false})
      )
      filesAdapter.setAll(state, interactiveFiles)
    },
    addFile: filesAdapter.addOne,
    updateFile: filesAdapter.updateOne,
    removeFile: filesAdapter.removeOne,
    awaitRenameFile(state, action: PayloadAction<string>) {
      const path = action.payload
      const file = state.entities[path]!
      file.isAwaitingRename = true
    },
    stopAwaitingRenameFile(state, action: PayloadAction<string>) {
      const path = action.payload
      const file = state.entities[path]!
      file.isAwaitingRename = false
    },
    activateFile(state, action: PayloadAction<string>) {
      const path = action.payload
      for (let id of state.ids) {
        const file = state.entities[id]!
        file.isActive = (id === path)
        file.isSelected = false
      }
    },
    toggleFileSelection(state, action: PayloadAction<string>) {
      const path = action.payload
      const file = state.entities[path]!
      file.isSelected = !file.isSelected
      file.isActive = false
    },
  },
})

export const { 
  loadFiles, addFile, updateFile, removeFile, 
  awaitRenameFile, stopAwaitingRenameFile,
  activateFile, toggleFileSelection,
} = filesSlice.actions

export const filesSelectors = filesAdapter.getSelectors<RootState>(
  state => state.files
)

export const selectFilesInScope = createSelector(
  filesSelectors.selectAll,
  selectActiveFilter,
  selectPathsInScope,
  (files, activeFilter, pathsInScope) => {
    if (!activeFilter) {
      return files.filter(file => pathsInScope.has(getParentPath(file)))
    }
    else {
      if (activeFilter.id === 'all') {
        return files
      }
      else if (activeFilter.id === 'inbox') {
        return files.filter(file => getParentPath(file) === '')
      }
      else if (activeFilter.id === 'recents') {
        return files.filter(file => moment.duration(moment.now() - file.stat.mtime) <= moment.duration(7, 'days'))
      }
      else {
        return []
      }
    }
  }
)

export default filesSlice.reducer
