// Libraries
import { 
  ItemView, 
  WorkspaceLeaf,
} from 'obsidian'
import * as React from 'react'
import { Root, createRoot } from "react-dom/client"
// Modules
import TwoPaneBrowser from './components/TwoPaneBrowser'

export const TWO_PANE_BROWSER_VIEW = 'two-pane-browser-view'

export default class TwoPaneBrowserView extends ItemView {
  root?: Root

  constructor(leaf: WorkspaceLeaf) {
    super(leaf)
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
        <TwoPaneBrowser app={this.app} />
      </React.StrictMode>
    )
  }

  async onClose() {
    // TODO: restore the sidebar's width
    this.root?.unmount()
  }
}
