// Libraries
import { ItemView, WorkspaceLeaf } from 'obsidian'
import * as React from 'react'
import { Root, createRoot } from "react-dom/client"
import { Provider } from 'react-redux'
// Modules
import type TwoPaneBrowserPlugin from '../main'
import PluginContext from './PluginContext'
import TwoPaneBrowser from './TwoPaneBrowser'
import store from './store'

export const TWO_PANE_BROWSER_VIEW = 'two-pane-browser-view'

export default class TwoPaneBrowserView extends ItemView {
  root?: Root
  plugin

  constructor(leaf: WorkspaceLeaf, plugin: TwoPaneBrowserPlugin) {
    super(leaf)
    this.plugin = plugin
  }

  getViewType() {
    return TWO_PANE_BROWSER_VIEW
  }

  getDisplayText() {
    return "Two Pane Browser"
  }

  async onOpen() {
		// leftSplit.containerEl is not exposed
    const leftSplit = this.app.workspace.leftSplit
    if (leftSplit) {
      // @ts-ignore
      const sidebar = this.app.workspace.leftSplit.containerEl
      sidebar.setCssStyles({ width: '600px' })
    }
    this.root = createRoot(this.containerEl.children[1])
    this.root.render(
      <React.StrictMode>
        <PluginContext.Provider value={this.plugin}>
          <Provider store={store}>
            <TwoPaneBrowser />
          </Provider>
        </PluginContext.Provider>
      </React.StrictMode>
    )
  }

  async onClose() {
    // TODO: restore the sidebar's width
    this.root?.unmount()
  }
}
