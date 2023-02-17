// Libraries
import { Plugin, Vault, TAbstractFile, TFile, TFolder, getAllTags } from 'obsidian'
// Modules
import store from './plugin/store'
import TwoPaneBrowserView, { TWO_PANE_BROWSER_VIEW } from './plugin/view'
import TwoPaneBrowserSettingTab from './features/settings/TwoPaneBrowserSettingTab'
import { TwoPaneBrowserSettings, DEFAULT_SETTINGS, loadSettings } from './features/settings/settingsSlice'
import { FileMeta, createFilePreview, loadFiles, addFile } from './features/files/filesSlice'
import { FolderMeta, loadFolders, addFolder } from './features/folders/foldersSlice'

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
			leaf => new TwoPaneBrowserView(leaf, this)
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

		// Register handlers for vault updates
		this.app.vault.on('create', this.createFileOrFolder.bind(this))
		this.app.vault.on('delete', this.deleteFileOrFolder.bind(this))
		this.app.vault.on('rename', this.renameFileOrFolder.bind(this))
		this.app.vault.on('modify', this.modifyFileOrFolder.bind(this))

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log(store.getState()), 30 * 1000))
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TWO_PANE_BROWSER_VIEW)
		this.app.vault.off('create', this.createFileOrFolder.bind(this))
		this.app.vault.off('delete', this.deleteFileOrFolder.bind(this))
		this.app.vault.off('rename', this.renameFileOrFolder.bind(this))
		this.app.vault.off('modify', this.modifyFileOrFolder.bind(this))
	}

	async loadSettings() {
		const settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
		store.dispatch(loadSettings(settings))
	}

	async saveSettings(settings: TwoPaneBrowserSettings) {
		await this.saveData(settings)
		store.dispatch(loadSettings(settings))
	}

	async fileMetaFromTFile(file: TFile): Promise<FileMeta> {
		// TODO: delay this work until we're actually looking at it
		const contents = await app.vault.cachedRead(file)
		const preview = createFilePreview(contents)
		const tags = this.getTags(file)
		return {
			name: file.name,
			path: file.path,
			stat: file.stat,
			preview,
			tags
		}
	}

	folderMetaFromTFolder(folder: TFolder): FolderMeta {
		return {
			name: folder.name,
			path: folder.path,
			isExpanded: false,
			isSelected: false,
		}
	}

	// https://stackoverflow.com/a/71896674
	getTags(file: TFile) {
		const allTags = new Set<string>()
		const fileCache = this.app.metadataCache.getFileCache(file)
		if (fileCache) {
			const tags = getAllTags(fileCache) || []
			for (let tag of tags) {
				allTags.add(tag)
			}
		}
		return [...allTags]
	}

	async syncVaultFiles() {
		const root = this.app.vault.getRoot()
		const folders: FolderMeta[] = []
		const files: FileMeta[] = []
		Vault.recurseChildren(root, async f => {
			if (f instanceof TFile) {
				const file = await this.fileMetaFromTFile(f)
				files.push(file)
			}
			else if (f instanceof TFolder) {
				const folder = this.folderMetaFromTFolder(f)
				folders.push(folder)
			}
		})
		if (folders.length) {
			store.dispatch(loadFolders(folders))
		}
		if (files.length) {
			store.dispatch(loadFiles(files))
		}
	}

	// TODO: finish these
	async createFileOrFolder(f: TAbstractFile) {
		if (f instanceof TFile) {
			const file = await this.fileMetaFromTFile(f)
			store.dispatch(addFile(file))
		}
		else if (f instanceof TFolder) {
			const folder = this.folderMetaFromTFolder(f)
			store.dispatch(addFolder(folder))
		}
	}

	deleteFileOrFolder(f: TAbstractFile) {
		// console.log('deleteFileOrFolder: ', f)
	}

	renameFileOrFolder(f: TAbstractFile) {
		// console.log('renameFileOrFolder: ', f)
	}

	modifyFileOrFolder(f: TAbstractFile) {
		// console.log('modifyFileOrFolder: ', f)
	}
}
