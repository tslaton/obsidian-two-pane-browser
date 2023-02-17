// Libraries
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { getParentPath, getDescendantPaths, getChildPaths } from '../../utils'

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
    updateFolder: foldersAdapter.updateOne,
    removeFolder: foldersAdapter.removeOne,
    toggleFolderExpansion(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]
      if (folder) {
        folder.isExpanded = !folder.isExpanded
        // Deselect all descendants
        // const allFolderPaths = state.ids as string[]
        // const descendantPaths = getDescendantPaths(folder.path, allFolderPaths)
        // for (let descendantPath of descendantPaths) {
        //   const descendantFolder = state.entities[descendantPath]
        //   if (descendantFolder) {
        //     descendantFolder.isSelected = false
        //   }
        // }
      }
    },
    toggleFolderSelection(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]
      if (folder) {
        folder.isSelected = !folder.isSelected
        // Deselect parent - probably not desirable
        // const parentFolder = state.entities[getParentPath(folder)]
        // if (parentFolder) {
        //   parentFolder.isSelected = false
        // }
        // Deselect all descendants
        // const allFolderPaths = state.ids as string[]
        // const descendantPaths = getDescendantPaths(folder.path, allFolderPaths)
        // for (let descendantPath of descendantPaths) {
        //   const descendantFolder = state.entities[descendantPath]
        //   if (descendantFolder) {
        //     descendantFolder.isSelected = false
        //   }
        // }
      }
    },
    selectFolder(state, action: PayloadAction<string>) {
      const path = action.payload
      for (let id of state.ids) {
        const folder = state.entities[id]
        if (folder) {
          folder.isSelected = (id === path)
        }
      }
    }
  },
})

export const { 
  loadFolders, addFolder, updateFolder, removeFolder,
  toggleFolderExpansion, toggleFolderSelection, selectFolder, 
} = foldersSlice.actions

export const foldersSelectors = foldersAdapter.getSelectors<RootState>(
  state => state.folders
)

export const selectTopLevelFolders = createSelector(
  foldersSelectors.selectAll,
  folders => folders.filter(folder => folder.path === folder.name)
)

// FUTURE: evaluate performance; consider proxy-memoize 
// Ref: https://redux.js.org/usage/deriving-data-selectors#selector-factories
export const makeSelectChildFoldersByParentPath = () => {
  const selectChildFoldersByParentPath = createSelector(
    [
      foldersSelectors.selectAll,
      (state: RootState, parentPath: string) => parentPath,
    ],
    (folders, parentPath) => folders.filter(folder => getParentPath(folder) === parentPath)
  )
  return selectChildFoldersByParentPath
}

export const selectSelectedFolders = createSelector(
  foldersSelectors.selectAll,
  folders => folders.filter(folder => folder.isSelected)
)

export const selectPathsInScope = createSelector(
  foldersSelectors.selectAll,
  selectSelectedFolders,
  (folders, selectedFolders) => {
    const allPaths = folders.map(folder => folder.path)
    const pathsInScope = new Set<string>()
    // Consider the descendants of a selected folder in scope if none of its children are selected
    for (let selectedFolder of selectedFolders) {
      pathsInScope.add(selectedFolder.path)
      const descendantPaths = getDescendantPaths(selectedFolder.path, allPaths)
      const childPaths = new Set(getChildPaths(selectedFolder.path, descendantPaths))
      let hasSelectedChildren = false
      for (let otherSelectedFolder of selectedFolders) {
        if (childPaths.has(otherSelectedFolder.path)) {
          hasSelectedChildren = true
          break
        }
      }
      if (!hasSelectedChildren) {
        for (let descendantPath of descendantPaths) {
          pathsInScope.add(descendantPath)
        }
      }
    }
    return pathsInScope
  }
)

export default foldersSlice.reducer
