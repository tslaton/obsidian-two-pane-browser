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

export function createFilePreview(fileContents: string, numLines=2) {
  let preview = ''
  const lines = fileContents.split('\n')
  let lineCount = 0
  for (let line of lines) {
    if (lineCount >= numLines) {
      break
    }
    // Strip out tags and afterward, blank lines
    line = line.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim()
    if (line) {
      preview += `${line}\n`
      lineCount += 1
    }
  }
  return preview.trim()
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
    // TODO: possibly combine all of these into modifyFile
    updateFilePreview(state, action: PayloadAction<{ path: string, preview: string }>) {
      const { path, preview } = action.payload
      const file = state.entities[path]
      if (file) {
        file.preview = preview
      }
    },
    updateFileStats(state, action: PayloadAction<{ path: string, stat: FileStats }>) {
      const { path, stat } = action.payload
      const file = state.entities[path]
      if (file) {
        file.stat = stat
      }
    },
    updateFileTags(state, action: PayloadAction<{ path: string, tags: string[] }>) {
      const { path, tags } = action.payload
      const file = state.entities[path]
      if (file) {
        file.tags = tags
      }
    },
  },
})

export const { loadFiles, addFile, updateFilePreview, updateFileTags } = filesSlice.actions

export const filesSelectors = filesAdapter.getSelectors<RootState>(
  state => state.files
)
export const selectFilesInScope = createSelector(
  filesSelectors.selectAll,
  selectFoldersInScope,
  (files, foldersInScope) => {
    // TODO: actually this isn't fully correct logic - eg., notes selection doesn't grab notes/ai
    // might be better to do with forced selection/deselect anyway
    // TODO: cut out the middle man here?
    const pathsInScope = new Set(foldersInScope.map(folder => folder.path))
    const filteredFiles = files.filter(file => pathsInScope.has(getParentPath(file.name, file.path)))
    return filteredFiles
  } 
)

export default filesSlice.reducer
