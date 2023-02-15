// Libraries
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Modules
import type { RootState } from '../store'

// strip out lines containing tags and blank lines
// Ref: https://stackoverflow.com/a/27196193/8593354
export function createFilePreviewFromContents(fileContents: string) {
  let preview = ''
  const lines = fileContents.split('\n')
  for (let line of lines) {
    // line = line.replace(/#\S*|\s+/g, '')
    line = line.replace(/#\S+/g, '').trim()
    if (line) {
      preview += `${line}\n`
    }
  }
  return preview.trim()
}

export const filePreviewsSlice = createSlice({
  name: 'filePreviews',
  initialState: {} as Record<string, string>,
  reducers: {
    loadFilePreviewsByPath: (state, action: PayloadAction<Record<string, string>>) => {
      const filePreviews = action.payload
      return filePreviews
    },
  },
})

export const { loadFilePreviewsByPath } = filePreviewsSlice.actions

export const selectFilePreviewsByPath = (state: RootState) => state.filePreviews

export default filePreviewsSlice.reducer
