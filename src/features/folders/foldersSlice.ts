// Libraries
import { TAbstractFile, TFolder, TFile } from 'obsidian'
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import type { FileMeta, fileMetaFromTFile } from '../files/filesSlice'

export interface FolderMeta {
  name: string
  path: string
  isExpanded: boolean
  isSelected: boolean
}

export function folderMetaFromTFolder(folder: TFolder): FolderMeta {
  const files = folder.children.filter(child => child instanceof TFile) as TFile[]
  const folders = folder.children.filter(child => child instanceof TFolder) as TFolder[]
  return {
    name: folder.name,
    path: folder.path,
  }
}

const foldersAdapter = createEntityAdapter<FolderMeta>({
  selectId: folder => folder.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const foldersSlice = createSlice({
  name: 'folders',
  initialState: foldersAdapter.getInitialState(),
  reducers: {
    foldersReceived(state, action) {
      foldersAdapter.setAll(state, action.payload.files)
    }
  },
})

export const { foldersSlice } = foldersSlice.actions


export const foldersSelectors = foldersAdapter.getSelectors<RootState>(
  state => state.folders
)

export default foldersSlice.reducer
