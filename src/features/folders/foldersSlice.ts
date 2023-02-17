// Libraries
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { getParentPath } from '../../utils'

export interface FolderMeta {
  name: string
  path: string
  isExpanded: boolean
  isSelected: boolean
}

const foldersAdapter = createEntityAdapter<FolderMeta>({
  selectId: folder => folder.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const foldersSlice = createSlice({
  name: 'folders',
  initialState: foldersAdapter.getInitialState(),
  reducers: {
    loadFolders(state, action: PayloadAction<FolderMeta[]>) {
      foldersAdapter.setAll(state, action.payload)
    },
    addFolder: foldersAdapter.addOne,
    toggleFolderExpansion(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]
      if (folder) {
        folder.isExpanded = !folder.isExpanded
      }
      // TODO: if closing a folder, deselect all descendants
    },
    toggleFolderSelection(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]
      if (folder) {
        folder.isSelected = !folder.isSelected
      }
    },
    selectFolder(state, action: PayloadAction<string>) {
      const path = action.payload
      for (let id of state.ids) {
        const folder = state.entities[id]
        if (folder) {
          if (id === path) {
            folder.isSelected = true
          }
          else {
            folder.isSelected = false
          }
        }
      }
    }
  },
})

export const { loadFolders, addFolder, toggleFolderExpansion, toggleFolderSelection, selectFolder } = foldersSlice.actions

export const foldersSelectors = foldersAdapter.getSelectors<RootState>(
  state => state.folders
)

export const selectTopLevelFolders = createSelector(
  foldersSelectors.selectAll,
  folders => folders.filter(folder => folder.path === folder.name)
)

// TODO: evaluate performance; consider proxy-memoize 
// Ref: https://redux.js.org/usage/deriving-data-selectors#selector-factories
export const makeSelectChildFoldersByParentPath = () => {
  const selectChildFoldersByParentPath = createSelector(
    [
      foldersSelectors.selectAll,
      (state: RootState, parentPath: string) => parentPath,
    ],
    (folders, parentPath) => folders.filter(folder => getParentPath(folder.name, folder.path) === parentPath)
  )
  return selectChildFoldersByParentPath
}

export const selectFoldersInScope = createSelector(
  foldersSelectors.selectAll,
  folders => {
    const selectedFolders = folders.filter(folder => folder.isSelected)
    // If a child of folder has been selected, eliminate its parent scope
    // TODO: better to do with programmatic select/deselect
    // const scopesToEliminate = new Set<string>()
    // for (let folder of selectedFolders) {
    //   scopesToEliminate.add(getParentPath(folder.name, folder.path))
    // }
    // return selectedFolders.filter(folder => !scopesToEliminate.has(folder.path))
    
    // Consider the descendants of a folder selected
    const foldersInScope = new Set<FolderMeta>()
    const selectedPaths = new Set(selectedFolders.map(folder => folder.path))
    for (let folder of folders) {
      for (let selectedPath of selectedPaths) {
        if (folder.path.startsWith(selectedPath)) {
          foldersInScope.add(folder)
        }
      }
    }
    return [...foldersInScope]
  }
)

export default foldersSlice.reducer
