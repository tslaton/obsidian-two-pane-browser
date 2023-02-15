// Libraries
import { TFolder, TFile } from 'obsidian'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../store'

export interface FileMeta {
  name: string
  path: string
}

export interface FolderMeta {
  name: string
  path: string
  files: FileMeta[]
  children: FolderMeta[]
}

export function fileMetaFromTFile(file: TFile): FileMeta {
  return {
    name: file.name,
    path: file.path,
  }
}

export function folderMetaFromTFolder(folder: TFolder): FolderMeta {
  const files = folder.children.filter(child => child instanceof TFile) as TFile[]
  const folders = folder.children.filter(child => child instanceof TFolder) as TFolder[]
  return {
    name: folder.name,
    path: folder.path,
    files: files.map(file => fileMetaFromTFile(file)),
    children: folders.map(folder => folderMetaFromTFolder(folder)),
  }
}

export const folderTreeSlice = createSlice({
  name: 'folderTree',
  initialState: { name: '', path: '/', files: [], children: [] } as FolderMeta,
  reducers: {
    loadFileTree: (state, action: PayloadAction<FolderMeta>) => {
      const folderTree = action.payload
      state.files = folderTree.files
      state.children = folderTree.children
    },
  },
})

export const { loadFileTree } = folderTreeSlice.actions

export const selectFolderTree = (state: RootState) => state.folderTree

export default folderTreeSlice.reducer
