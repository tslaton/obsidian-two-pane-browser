// Libraries
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../plugin/store'

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

export const filePreviewsByPathSlice = createSlice({
  name: 'filePreviewsByPath',
  initialState: {} as Record<string, string>,
  reducers: {
    loadFilePreviewsByPath: (state, action: PayloadAction<Record<string, string>>) => {
      const filePreviews = action.payload
      return filePreviews
    },
  },
})

export const { loadFilePreviewsByPath } = filePreviewsByPathSlice.actions

export const selectFilePreviewsByPath = (state: RootState) => state.filePreviewsByPath

export default filePreviewsByPathSlice.reducer
