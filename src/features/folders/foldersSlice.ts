// Libraries
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { getParentPath, getDescendantPaths, getChildPaths } from '../../utils'

export interface FolderMeta {
  name: string
  path: string
}

export interface InteractiveFolder extends FolderMeta {
  isExpanded: boolean
  isSelected: boolean // === isActive for folders (multiple at once)
  isAwaitingRename: boolean
}

const foldersAdapter = createEntityAdapter<InteractiveFolder>({
  selectId: folder => folder.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const foldersSlice = createSlice({
  name: 'folders',
  initialState: foldersAdapter.getInitialState(),
  reducers: {
    loadFolders(state, action: PayloadAction<FolderMeta[]>) {
      const interactiveFolders = action.payload.map(folder => 
        ({...folder, isExpanded: false, isSelected: false, isAwaitingRename: false})
      )
      foldersAdapter.setAll(state, interactiveFolders)
    },
    addFolder: foldersAdapter.addOne,
    updateFolder: foldersAdapter.updateOne,
    removeFolder: foldersAdapter.removeOne,
    awaitRenameFolder(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]!
      folder.isAwaitingRename = true
      const parentPath = getParentPath(folder)
      const parentFolder = state.entities[parentPath]
      if (parentFolder) {
        parentFolder.isExpanded = true
      }
    },
    stopAwaitingRenameFolder(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]!
      folder.isAwaitingRename = false
    },
    toggleFolderExpansion(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]!
      folder.isExpanded = !folder.isExpanded
      // Deselect all descendants
      // const allFolderPaths = state.ids as string[]
      // const descendantPaths = getDescendantPaths(folder.path, allFolderPaths)
      // for (let descendantPath of descendantPaths) {
      //   const descendantFolder = state.entities[descendantPath]!
      //   descendantFolder.isSelected = false
      // }
    },
    toggleFolderSelection(state, action: PayloadAction<string>) {
      const path = action.payload
      const folder = state.entities[path]!
      folder.isSelected = !folder.isSelected
      // Deselect parent - probably not desirable
      // const parentFolder = state.entities[getParentPath(folder)]!
      // parentFolder.isSelected = false
      // Deselect all descendants
      // const allFolderPaths = state.ids as string[]
      // const descendantPaths = getDescendantPaths(folder.path, allFolderPaths)
      // for (let descendantPath of descendantPaths) {
      //   const descendantFolder = state.entities[descendantPath]!
      //   descendantFolder.isSelected = false
      // }
    },
    selectFolder(state, action: PayloadAction<string>) {
      const path = action.payload
      for (let id of state.ids) {
        const folder = state.entities[id]!
        folder.isSelected = (id === path)
      }
    },
    deselectAllFolders(state) {
      const folders = Object.values(state.entities) as InteractiveFolder[]
      for (let folder of folders) {
        folder.isSelected = false
      }
    },
  },
})

export const { 
  loadFolders, addFolder, updateFolder, removeFolder, 
  awaitRenameFolder, stopAwaitingRenameFolder,
  toggleFolderExpansion, toggleFolderSelection, selectFolder, deselectAllFolders,
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
