// Libraries
import { TAbstractFile, TFile, FileStats } from 'obsidian'
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'

export interface FileMeta {
  name: string
  path: string
  stats: FileStats
}

export function fileMetaFromTFile(file: TFile): FileMeta {
  return {
    name: file.name,
    path: file.path,
    stats: file.stat,
  }
}

const filesAdapter = createEntityAdapter<FileMeta>({
  selectId: file => file.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const filesSlice = createSlice({
  name: 'files',
  initialState: filesAdapter.getInitialState(),
  reducers: {
    filesReceived(state, action) {
      filesAdapter.setAll(state, action.payload.files)
    }
  },
})

export const { filesReceived } = filesSlice.actions


export const filesSelectors = filesAdapter.getSelectors<RootState>(
  state => state.files
)

export default filesSlice.reducer
