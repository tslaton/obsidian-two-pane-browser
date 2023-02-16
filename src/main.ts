// Libraries
import { Plugin } from 'obsidian'
// Modules
import TwoPaneBrowserView, { TWO_PANE_BROWSER_VIEW } from './view'
import {TwoPaneBrowserSettings, DEFAULT_SETTINGS, TwoPaneBrowserSettingTab } from './settings'
import { store } from './settings'
const [state, setState] = store

export default class TwoPaneBrowserPlugin extends Plugin {
	settings: TwoPaneBrowserSettings

	async activateView() {
		this.app.workspace.detachLeavesOfType(TWO_PANE_BROWSER_VIEW)

		await this.app.workspace.getLeftLeaf(false).setViewState({
			type: TWO_PANE_BROWSER_VIEW,
			active: true,
		})

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(TWO_PANE_BROWSER_VIEW)[0]
		)
	}

	async onload() {
		await this.loadSettings()

		this.registerView(
			TWO_PANE_BROWSER_VIEW,
			leaf => new TwoPaneBrowserView(leaf)
		)

		this.addRibbonIcon(
			'folder-tree', 
			'Open Two Pane Browser', 
			event => {
				this.activateView()
			}
		)

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TwoPaneBrowserSettingTab(this.app, this))

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000))
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TWO_PANE_BROWSER_VIEW)
	}

	async loadSettings() {
		const settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
		setState({ settings })
		console.log('settings: ', settings)
		this.settings = settings
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
