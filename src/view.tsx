// Libraries
import { 
  ItemView, 
  WorkspaceLeaf,
} from 'obsidian'
import * as React from 'react'
import { Root, createRoot } from "react-dom/client"
// Modules
import { getTags } from './utils'

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
		// Get some data
		// https://stackoverflow.com/a/71896674
		const files = this.app.vault.getFiles()
		console.log('files: ', files)
    const tags = getTags(files, this.app.metadataCache)
    console.log('tags: ', tags)

		// Draw the view
		// leftSplit.containerEl is not exposed
    // @ts-ignore
		const sidebar = this.app.workspace.leftSplit.containerEl
		sidebar.setCssStyles({ width: '500px' })

    this.root = createRoot(this.containerEl.children[1])
    this.root.render(
      <React.StrictMode>
        <div>
          <h3>Two Pane Browser View</h3>
        </div>
      </React.StrictMode>
    )
  }

  async onClose() {
    // TODO: restore the sidebar's width
    this.root?.unmount()
  }
}
