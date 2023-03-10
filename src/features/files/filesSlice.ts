// Libraries
import { FileStats, moment } from 'obsidian'
import { createSelector, createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../../plugin/store'
import { InteractiveFolder, selectPathsInScope } from '../folders/foldersSlice'
import { selectActiveFilter } from '../filters/filtersSlice'
import { requestSearchResults, fulfillSearchResults, failSearchResults } from '../search/extraActions'
import { getParentPath, getDescendantPaths, SearchResult } from '../../utils'

export interface FileMeta {
  name: string
  path: string
  stat: FileStats
  preview: string
  tags: string[]
}

export interface FileSearchResults {
  titleMatches?: SearchResult
  contentMatches?: SearchResult[]
}

export type FileSearchResultsByPath = Record<string, FileSearchResults>
// Want results that will enable call to editor.setCursor to jump to them in the file
// https://github.com/obsidianmd/obsidian-api/blob/bceb489fc25ceba5973119d6e57759d64850f90d/obsidian.d.ts#L908
// to do highlights, Obsidian adds span.is-flashing around matches in editor and span.search-result-file-matched-text around results
// for each token, find all occurences
// for each occurence, record the start index (stop is this + token.length)
// define context size = 150 (say)
// distribute the contexts over the indices
// create list of contexts: blah blah blah <span class="search-match" data-editor-index=15>match</span>
export interface InteractiveFile extends FileMeta {
  isActive: boolean
  isSelected: boolean
  isAwaitingRename: boolean
  searchResults?: FileSearchResults
}

const filesAdapter = createEntityAdapter<InteractiveFile>({
  selectId: file => file.path,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

export const filesSlice = createSlice({
  name: 'files',
  initialState: filesAdapter.getInitialState(),
  reducers: {
    loadFiles(state, action: PayloadAction<FileMeta[]>) {
      const interactiveFiles = action.payload.map(file => 
        ({...file, isActive: false, isSelected: false, isAwaitingRename: false})
      )
      filesAdapter.setAll(state, interactiveFiles)
    },
    addFile: filesAdapter.addOne,
    updateFile: filesAdapter.updateOne,
    removeFile: filesAdapter.removeOne,
    awaitRenameFile(state, action: PayloadAction<string>) {
      const path = action.payload
      const file = state.entities[path]!
      file.isAwaitingRename = true
    },
    stopAwaitingRenameFile(state, action: PayloadAction<string>) {
      const path = action.payload
      const file = state.entities[path]!
      file.isAwaitingRename = false
    },
    activateFile(state, action: PayloadAction<string>) {
      const path = action.payload
      for (let id of state.ids) {
        const file = state.entities[id]!
        file.isActive = (id === path)
        file.isSelected = false
      }
    },
    toggleFileSelection(state, action: PayloadAction<string>) {
      const path = action.payload
      const file = state.entities[path]!
      file.isSelected = !file.isSelected
      file.isActive = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestSearchResults, (state) => {
        for (let [_, file] of Object.entries(state.entities)) {
          file!.searchResults = undefined
        }
      })
      .addCase(fulfillSearchResults, (state, action: PayloadAction<FileSearchResultsByPath>) => {
        const fileSearchResultsByPath = action.payload
        for (let [path, searchResults] of Object.entries(fileSearchResultsByPath)) {
          const file = state.entities[path]
          if (file) {
            file.searchResults = searchResults
          }
        }
      })
      .addCase(failSearchResults, (state) => {
        for (let [_, file] of Object.entries(state.entities)) {
          file!.searchResults = undefined
        }
      })
  }
})

export const { 
  loadFiles, addFile, updateFile, removeFile, 
  awaitRenameFile, stopAwaitingRenameFile,
  activateFile, toggleFileSelection,
} = filesSlice.actions

export const filesSelectors = filesAdapter.getSelectors<RootState>(
  state => state.files
)

export const selectFileCountsByParentPath = createSelector(
  filesSelectors.selectAll,
  files => {
    const countsByParentPath: Record<string, number> = {}
    for (let file of files) {
      const parentPath = getParentPath(file)
      countsByParentPath[parentPath] = (countsByParentPath[parentPath] || 0) + 1
    }
    return countsByParentPath
  }
)

export const makeSelectFileCountByFolder = () => {
  const selectFileCountByFolder = createSelector(
    [
      selectFileCountsByParentPath,
      (state: RootState, folder: InteractiveFolder) => folder,
    ],
    (fileCountsByParentPath, folder) => {
      if (folder.isExpanded) {
        return fileCountsByParentPath[folder.path]!
      }
      else {
        const allPaths = Object.keys(fileCountsByParentPath)
        const descendantPaths = getDescendantPaths(folder.path, allPaths)
        let count = fileCountsByParentPath[folder.path]!
        for (let path of descendantPaths) {
          count += fileCountsByParentPath[path]!
        }
        return count
      }
    }
  )
  return selectFileCountByFolder
}

export const selectInboxFiles = createSelector(
  filesSelectors.selectAll,
  files => files.filter(file => getParentPath(file) === '')
)

// TODO: moment.now() will get stale, should not be in a selector
export const selectRecentFiles = createSelector(
  filesSelectors.selectAll,
  files => files.filter(file => moment.duration(moment.now() - file.stat.mtime) <= moment.duration(7, 'days'))
)

// Eventually dependent on user-created filters but hardcoded for now
export const selectFileCountsByFilter = createSelector(
  filesSelectors.selectAll,
  selectInboxFiles,
  selectRecentFiles,
  (allFiles, inboxFiles, recentFiles) => {
    const fileCountsByFilter: Record<string, number> = {
      all: allFiles.length,
      inbox: inboxFiles.length,
      recents: recentFiles.length,
    }
    return fileCountsByFilter
  }
)

export const selectFilesInScope = createSelector(
  filesSelectors.selectAll,
  selectActiveFilter,
  selectInboxFiles,
  selectRecentFiles,
  selectPathsInScope,
  (files, activeFilter, inboxFiles, recentFiles, pathsInScope) => {
    if (!activeFilter) {
      return files.filter(file => pathsInScope.has(getParentPath(file)))
    }
    else {
      if (activeFilter.id === 'all') {
        return files
      }
      else if (activeFilter.id === 'inbox') {
        return inboxFiles
      }
      else if (activeFilter.id === 'recents') {
        return recentFiles
      }
      else {
        return []
      }
    }
  }
)

export default filesSlice.reducer
