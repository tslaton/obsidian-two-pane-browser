// Libraries
import { 
	App, Plugin, PluginManifest, 
	Vault, TAbstractFile, TFile, TFolder, 
	CachedMetadata, getAllTags,
} from 'obsidian'
// Modules
import store from './plugin/store'
import TwoPaneBrowserView, { TWO_PANE_BROWSER_VIEW } from './plugin/view'
import TwoPaneBrowserSettingTab from './features/settings/TwoPaneBrowserSettingTab'
import { TwoPaneBrowserSettings, DEFAULT_SETTINGS, loadSettings } from './features/settings/settingsSlice'
import { FileMeta, loadFiles, addFile, updateFile, removeFile } from './features/files/filesSlice'
import { FolderMeta, loadFolders, addFolder, updateFolder, removeFolder } from './features/folders/foldersSlice'
import { getParentPath } from './utils'

export default class TwoPaneBrowserPlugin extends Plugin {
	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest)
		this.createFileOrFolder = this.createFileOrFolder.bind(this)
		this.deleteFileOrFolder = this.deleteFileOrFolder.bind(this)
		this.renameFileOrFolder = this.renameFileOrFolder.bind(this)
		this.metadataCacheChanged = this.metadataCacheChanged.bind(this)
	}

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
		this.app.vault.on('create', this.createFileOrFolder)
		this.app.vault.on('delete', this.deleteFileOrFolder)
		this.app.vault.on('rename', this.renameFileOrFolder)
		// Register handlers for metadata cache updates
		this.app.metadataCache.on('changed', this.metadataCacheChanged)

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log(store.getState()), 30 * 1000))
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TWO_PANE_BROWSER_VIEW)
		this.app.vault.off('create', this.createFileOrFolder)
		this.app.vault.off('delete', this.deleteFileOrFolder)
		this.app.vault.off('rename', this.renameFileOrFolder)
		this.app.metadataCache.off('changed', this.metadataCacheChanged)
	}

	async loadSettings() {
		const settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
		store.dispatch(loadSettings(settings))
	}

	async saveSettings(settings: TwoPaneBrowserSettings) {
		await this.saveData(settings)
		store.dispatch(loadSettings(settings))
	}

	// FUTURE: delay this work until we're actually looking at it
	// Really, only want previews for files in viewport (but tags are important always for filtering)
	async inflatedFileMetaFromTFile(file: TFile, fileCache: CachedMetadata|null=null): Promise<FileMeta> {
		const contents = await app.vault.cachedRead(file)
		// FUTURE: leverage cache.sections to do Headers in previews
		const createFilePreview = (numLines=2) => {
			let preview = ''
			const lines = contents.split('\n')
			let lineCount = 0
			for (let line of lines) {
				if (lineCount >= numLines) {
					break
				}
				// Strip out tags and afterward, blank lines
				line = line.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim()
				if (line) {
					preview += `${line}\n`
					lineCount += 1
				}
			}
			return preview.trim()
		}
		// https://stackoverflow.com/a/71896674
		const getTags = () => {
			const allTags = new Set<string>()
			if (!fileCache) {
				fileCache = this.app.metadataCache.getFileCache(file)
			} 
			if (fileCache) {
				const tags = getAllTags(fileCache) || []
				for (let tag of tags) {
					allTags.add(tag)
				}
			}
			return [...allTags]
		}
		return {
			...this.fileMetaFromTFile(file),
			preview: createFilePreview(),
			tags: getTags(),
		}
	}

	fileMetaFromTFile(file: TFile): FileMeta {
		return {
			name: file.name,
			path: file.path,
			stat: file.stat,
			preview: '',
			tags: [],
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

	fetchFolders() {
		const root = this.app.vault.getRoot()
		const folders: FolderMeta[] = []
		Vault.recurseChildren(root, f => {
			if (f instanceof TFolder) {
				const folder = this.folderMetaFromTFolder(f)
				folders.push(folder)
			}
		})
		if (folders.length) {
			store.dispatch(loadFolders(folders))
		}
	}

	async fetchFiles(pathsInScope: Set<string>=new Set()) {
		const root = this.app.vault.getRoot()
		const files: FileMeta[] = []
		Vault.recurseChildren(root, async f => {
			if (f instanceof TFile) {
				if (pathsInScope.size === 0 || pathsInScope.has(getParentPath(f))) {
					const file = await this.inflatedFileMetaFromTFile(f)
					files.push(file)
				}
			}
		})
		if (files.length) {
			// FUTURE: decide whether to load or upsert here... we only ever care about files in scope right?
			store.dispatch(loadFiles(files))
		}
	}

	async createFileOrFolder(f: TAbstractFile) {
		if (f instanceof TFile) {
			const file = await this.inflatedFileMetaFromTFile(f)
			store.dispatch(addFile(file))
		}
		else if (f instanceof TFolder) {
			const folder = this.folderMetaFromTFolder(f)
			store.dispatch(addFolder(folder))
		}
	}

	deleteFileOrFolder(f: TAbstractFile) {
		if (f instanceof TFile) {
			store.dispatch(removeFile(f.path))
		}
		else if (f instanceof TFolder) {
			store.dispatch(removeFolder(f.path))
		}
	}

	renameFileOrFolder(f: TAbstractFile) {
		if (f instanceof TFile) {
			const file = this.fileMetaFromTFile(f)
			store.dispatch(updateFile({ id: file.path, changes: file }))
		}
		else if (f instanceof TFolder) {
			const folder = this.folderMetaFromTFolder(f)
			store.dispatch(updateFolder({ id: folder.path, changes: folder }))
		}
	}

	async metadataCacheChanged(f: TFile, data: string, cache: CachedMetadata) {
		const file = await this.inflatedFileMetaFromTFile(f, cache)
		store.dispatch(updateFile({id: file.path, changes: file }))
	}
}
