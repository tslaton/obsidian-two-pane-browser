// Libraries
import { createStore } from 'solid-js/store'
// Modules
import { DEFAULT_SETTINGS } from './settings'

const [state, setState] = createStore({
  settings: DEFAULT_SETTINGS,
  files: ['hello.md'],
})
