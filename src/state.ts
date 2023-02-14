// Libraries
import { 
  TAbstractFile,
  TFolder,
  TFile,
} from 'obsidian'
import { createSelector } from 'reselect'
import { recurseChildren } from './utils'

interface GlobalState {
  fileTree: TFolder | null,
  selectedFolders: string[],
}

interface Action {
  type: string
  payload: any
}

export function initGlobalState(): GlobalState {
  return {
    fileTree: null,
    selectedFolders: [],
  }
}

export const selectFileTree = (state: GlobalState) => state.fileTree
export const selectTopLevelFolders = createSelector(
  selectFileTree,
  (fileTree) => {
    return fileTree 
      ? fileTree.children.filter(x => x instanceof TFolder) as TFolder[]
      : []
  }
)
export const selectSelectedFolders = (state: GlobalState) => state.selectedFolders
export const selectFilesInScope = createSelector(
  selectFileTree,
  selectSelectedFolders,
  (fileTree, selectedFolders) => {
    const selectedFoldersAsSet = new Set(selectedFolders)
    const filesInScope: TFile[] = []
    recurseChildren(fileTree, fileOrFolder => {
      if (fileOrFolder instanceof TFolder) {
        const folder = fileOrFolder
        if (selectedFoldersAsSet.has(folder.path)) {
          for (let child of folder.children) {
            if (child instanceof TFile) {
              filesInScope.push(child)
            }
          }
        }
      }
    })
    return filesInScope
  }
)

export function reducer(state: GlobalState, action: Action) {
  switch(action.type) {
    case 'LOAD_FILETREE':
      return { ...state, fileTree: action.payload }
    default:
      return state
  }
}
