// Libraries
import { FileStats } from 'obsidian'
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { selectFoldersInScope } from '../folders/foldersSlice'

export interface FileMeta {
  name: string
  path: string
  preview: string
  tags: string[]
  stats: FileStats
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
    filesReceived(state, action: PayloadAction<FileMeta[]>) {
      filesAdapter.setAll(state, action.payload)
    },
    fileAdded: filesAdapter.addOne,
    // TODO: possibly combine all of these into modifyFile
    updateFilePreview(state, action: PayloadAction<{ path: string, preview: string }>) {
      const { path, preview } = action.payload
      const file = state.entities[path]
      if (file) {
        file.preview = preview
      }
    },
    updateFileStats(state, action: PayloadAction<{ path: string, stats: FileStats }>) {
      const { path, stats } = action.payload
      const file = state.entities[path]
      if (file) {
        file.stats = stats
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

export const { filesReceived, fileAdded, updateFilePreview, updateFileTags } = filesSlice.actions


export const filesSelectors = filesAdapter.getSelectors<RootState>(
  state => state.files
)
export const selectFilesInScope = createSelector(
  filesSelectors.selectAll,
  selectFoldersInScope,
  (files, foldersInScope) => {
    // TODO: cut out the middle man here?
    const pathsInScope = new Set(foldersInScope.map(folder => folder.path))
    return files.filter(file => pathsInScope.has(file.path))
  } 
)

export default filesSlice.reducer
