// Libraries
import { createAction } from '@reduxjs/toolkit'
// Modules
import { FileSearchResultsByPath } from '../files/filesSlice'

// TODO: Refactor as asyncThunk; for now plugin will direct this cycle
export const requestSearchResults = createAction('search/requestSearchResults')
export const fulfillSearchResults = createAction<FileSearchResultsByPath>('search/fulfillSearchResults')
export const failSearchResults = createAction<string>('search/failSearchResults')
