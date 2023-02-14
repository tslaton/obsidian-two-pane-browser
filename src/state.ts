// Libraries
import { 
  TAbstractFile,
  TFolder,
  TFile,
} from 'obsidian'
import { createSelector } from 'reselect'
import { recurseChildren } from './utils'

interface GlobalState {
  fileTree: TFolder | null
  isOpenByPath: Record<string, boolean>
  isSelectedByPath: Record<string, boolean>
}

interface Action {
  type: string
  payload: any
}

export function initGlobalState(): GlobalState {
  return {
    fileTree: null,
    isOpenByPath: {},
    isSelectedByPath: {},
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
export const selectIsOpenByPath = (state: GlobalState) => state.isOpenByPath
export const selectIsSelectedByPath = (state: GlobalState) => state.isSelectedByPath
// TODO: this doesn't actually update
export const selectFilesInScope = createSelector(
  selectFileTree,
  selectIsSelectedByPath,
  (fileTree, isSelectedByPath) => {
    console.log('isSelectedByPath: ', isSelectedByPath)
    const filesInScope: TFile[] = []
    recurseChildren(fileTree, f => {
      if (f instanceof TFolder && isSelectedByPath[f.path]) {
        const files = f.children.filter(child => child instanceof TFile) as TFile[]
        filesInScope.push(...files)
      }
    })
    return filesInScope
  }
)

export function reducer(state: GlobalState, action: Action) {
  switch(action.type) {
    case 'LOAD_FILETREE': {
      return { 
        ...state, 
        fileTree: action.payload,
      }
    }
    case 'TOGGLE_IS_OPEN_BY_PATH': {
      const path = action.payload
      const isOpenByPath = state.isOpenByPath
      const isOpen = !!isOpenByPath[path]
      return {
        ...state, 
        isOpenByPath: { ...isOpenByPath, [path]: !isOpen },
      }
    }
    case 'TOGGLE_IS_SELECTED_BY_PATH': {
      const path = action.payload
      const isSelectedByPath = state.isSelectedByPath
      const isSelected = !!isSelectedByPath[path]
      return {
        ...state, 
        isSelectedByPath: { ...isSelectedByPath, [path]: !isSelected },
      }
    }
    case 'SELECT_BY_PATH': {
      const path = action.payload
      return {
        ...state,
        isSelectedByPath: { [path]: true },
      }
    }
    default:
      return state
  }
}
