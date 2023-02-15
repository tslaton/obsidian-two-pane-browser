// Libraries
import { ItemView, WorkspaceLeaf } from 'obsidian'
import * as React from 'react'
import { Root, createRoot } from "react-dom/client"
import { Provider } from 'react-redux'
// Modules
import TwoPaneBrowser from './components/TwoPaneBrowser'
import { TwoPaneBrowserSettings } from './settings'
import store from './store'

export const TWO_PANE_BROWSER_VIEW = 'two-pane-browser-view'

export default class TwoPaneBrowserView extends ItemView {
  root?: Root
  settings: TwoPaneBrowserSettings

  constructor(leaf: WorkspaceLeaf, settings: TwoPaneBrowserSettings) {
    super(leaf)
    // TODO: something cleaner
    this.settings = settings
  }

  getViewType() {
    return TWO_PANE_BROWSER_VIEW
  }

  getDisplayText() {
    return "Two Pane Browser"
  }

  async onOpen() {
		// leftSplit.containerEl is not exposed
    // @ts-ignore
		const sidebar = this.app.workspace.leftSplit.containerEl
		sidebar.setCssStyles({ width: '600px' })

    this.root = createRoot(this.containerEl.children[1])
    this.root.render(
      <React.StrictMode>
        <Provider store={store}>
          <TwoPaneBrowser app={this.app} settings={this.settings}/>
        </Provider>
      </React.StrictMode>
    )
  }

  async onClose() {
    // TODO: restore the sidebar's width
    this.root?.unmount()
  }
}
