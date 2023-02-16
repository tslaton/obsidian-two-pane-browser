// Libraries
import { ItemView, WorkspaceLeaf } from 'obsidian'
import { render } from 'solid-js/web'
// Modules
import TwoPaneBrowser from './solid/TwoPaneBrowser'

export const TWO_PANE_BROWSER_VIEW = 'two-pane-browser-view'

export default class TwoPaneBrowserView extends ItemView {
  dispose?: () => void

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
    const leftSplit = this.app.workspace.leftSplit
    if (leftSplit) {
      // @ts-ignore
      const sidebar = this.app.workspace.leftSplit.containerEl
      sidebar.setCssStyles({ width: '600px' })
    }
    this.dispose = render(() => <TwoPaneBrowser />, this.containerEl.children[1])
  }

  async onClose() {
    // TODO: restore the sidebar's width
    this.dispose?.()
  }
}
