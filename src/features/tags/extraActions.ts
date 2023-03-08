// Libraries
import { createAction } from '@reduxjs/toolkit'

// Avoid circular import in consumers
export const revealTag = createAction<string>('tagFilters/revealTag')
