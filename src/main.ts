// Libraries
import { Plugin } from 'obsidian'
// Modules
import store from './plugin/store'
import TwoPaneBrowserView, { TWO_PANE_BROWSER_VIEW } from './plugin/view'
import { TwoPaneBrowserSettingTab } from './features/settings/settingsTab'
import { TwoPaneBrowserSettings, DEFAULT_SETTINGS, loadSettings } from './features/settings/settingsSlice'
import { loadFolderTree } from './slices/folderTreeSlice'

export default class TwoPaneBrowserPlugin extends Plugin {
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

		store.dispatch(loadFolderTree(this.app.vault.getRoot()))
		// Register handlers for vault updates
		this.app.vault.on('create', this.createFileOrFolder)
		this.app.vault.on('delete', this.deleteFileOrFolder)
		this.app.vault.on('rename', this.renameFileOrFolder)
		this.app.vault.on('modify', this.modifyFileOrFolder)

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// TODO: refresh the tag and file lists periodically as a failsafe?
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000))
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TWO_PANE_BROWSER_VIEW)
		this.app.vault.off('create', this.createFileOrFolder)
		this.app.vault.off('delete', this.deleteFileOrFolder)
		this.app.vault.off('rename', this.renameFileOrFolder)
		this.app.vault.off('modify', this.modifyFileOrFolder)
	}

	async loadSettings() {
		const settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
		store.dispatch(loadSettings(settings))
	}

	async saveSettings(settings: TwoPaneBrowserSettings) {
		await this.saveData(settings)
		store.dispatch(loadSettings(settings))
	}

	createFileOrFolder(f: TAbstractFile) {

	}

	deleteFileOrFolder(f: TAbstractFile) {

	}

	renameFileOrFolder(f: TAbstractFile) {

	}

	modifyFileOrFolder(f: TAbstractFile) {

	}
}
