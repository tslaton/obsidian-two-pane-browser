// Libraries
import { 
	App, Plugin, PluginManifest, 
	Vault, TFile, TFolder, MarkdownView, WorkspaceLeaf, PaneType,
	CachedMetadata, getAllTags,
	moment,
} from 'obsidian'
// Modules
import store from './plugin/store'
import TwoPaneBrowserView, { TWO_PANE_BROWSER_VIEW } from './plugin/view'
import TwoPaneBrowserSettingTab from './plugin/settingsTab'
import { TwoPaneBrowserSettings, DEFAULT_SETTINGS, loadSettings } from './features/settings/settingsSlice'
import { FileMeta, loadFiles, addFile, updateFile, removeFile, activateFile } from './features/files/filesSlice'
import { FolderMeta, loadFolders, addFolder, updateFolder, removeFolder, awaitRenameFolder } from './features/folders/foldersSlice'
import { revealTag } from './features/tags/extraActions'
import { requestSearchResults, fulfillSearchResults, failSearchResults } from './features/search/searchSlice'
import { getParentPath, selectElementContent } from './utils'

export default class TwoPaneBrowserPlugin extends Plugin {
	// Used to avoid a timeout waiting for the beginning of a new file 
	// to be selected on 'file-open' before selecting the title for renaming
	renameNextFileOpened: boolean

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest)
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

		// Watch for clicks on tags to redirect from default search to this search
		this.registerDomEvent(document.body, 'click', (event: MouseEvent) => {
			if (!(event.target instanceof HTMLElement)) {
				return
			}
			const isTagFilter = (
				event.target.hasClass('tag-filter') ||
				(event.target.parentElement && event.target.parentElement.hasClass('tag-filter'))
			)
			if (isTagFilter) {
				return
			}
			const isLivePreviewHashtag = event.target instanceof HTMLSpanElement && event.target.hasClass('cm-hashtag')
			const isReadingViewHashtag = event.target instanceof HTMLAnchorElement && event.target.hasClass('tag')
			if (isLivePreviewHashtag || isReadingViewHashtag) {
				event.stopPropagation()
				let tag: string = ''
				if (isLivePreviewHashtag) {
					const classes = event.target.className.split(' ')
					tag = classes.find(c => c.startsWith('cm-tag-'))!.substring(7)
				}
				else if (isReadingViewHashtag) {
					tag = event.target.href.split('#').last()!
				}
				store.dispatch(revealTag(`#${tag.trim()}`))
			}
		}, { capture: true, passive: true })

		// Watch the filesystem for changes via vault
		this.registerEvent(this.app.vault.on('create', async (f) => {
			if (f instanceof TFile) {
				const file = await this.inflatedFileMetaFromTFile(f)
				store.dispatch(addFile({ 
					...file,
					isActive: false,
					isSelected: false, 
					isAwaitingRename: false,
				}))
			}
			else if (f instanceof TFolder) {
				const folder = this.folderMetaFromTFolder(f)
				store.dispatch(addFolder({
					...folder,
					isExpanded: false,
					isSelected: false,
					isAwaitingRename: false,
				}))
			}
		}))

		this.registerEvent(this.app.vault.on('delete', (f) => {
			if (f instanceof TFile) {
				store.dispatch(removeFile(f.path))
			}
			else if (f instanceof TFolder) {
				store.dispatch(removeFolder(f.path))
			}
		}))

		this.registerEvent(this.app.vault.on('rename', async (f, oldPath) => {
			if (f instanceof TFile) {
				const file = await this.inflatedFileMetaFromTFile(f)
				store.dispatch(updateFile({ id: oldPath, changes: file }))
			}
			else if (f instanceof TFolder) {
				const folder = this.folderMetaFromTFolder(f)
				store.dispatch(updateFolder({ id: oldPath, changes: folder }))
			}
		}))

		// Watch metadataCache for changes
		this.registerEvent(this.app.metadataCache.on('changed', async (f, data, cache) => {
			const file = await this.inflatedFileMetaFromTFile(f, cache)
			store.dispatch(updateFile({id: file.path, changes: file }))
		}))

		// Watch workspace for changes
		this.registerEvent(this.app.workspace.on('file-open', (file) => {
			// Event fires when a file tab is closed, too (with file === null)
			if (file) {
				if (this.renameNextFileOpened) {
					const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView)!
					const container = markdownView.containerEl
					let titleContainer = container.querySelector('div[contenteditable="true"].inline-title') as HTMLElement
					// It's possible the user has elected to hide inline titles
					// For future reference, that setting exists in app.vault.config
					if (!titleContainer || getComputedStyle(titleContainer).display === 'none') {
						titleContainer = container.querySelector('div[contenteditable="true"].view-header-title') as HTMLElement
					}
					selectElementContent(titleContainer)
					this.renameNextFileOpened = false
				}
				// TODO: fancier dispatch for folder tree context and/or isActive vs. isSelected?
				store.dispatch(activateFile(file.path))
			}
		}))

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log(store.getState()), 10 * 1000))
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TWO_PANE_BROWSER_VIEW)
	}

	async loadSettings() {
		const settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
		store.dispatch(loadSettings(settings))
	}

	async saveSettings(settings: TwoPaneBrowserSettings) {
		await this.saveData(settings)
		store.dispatch(loadSettings(settings))
	}

	// FUTURE: leverage cache.sections to do Headers in previews
	// FUTURE: process only the beginning of a potentially long string
	// Ref: https://www.theinformationlab.co.uk/2020/01/03/regex-extracting-the-first-n-words/
	async getFilePreview(file: TFile, numLines=2) {
		const contents = await app.vault.cachedRead(file)
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

	getFileTags(file: TFile, fileCache: CachedMetadata|null=null) {
		// https://stackoverflow.com/a/71896674
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

	async inflatedFileMetaFromTFile(f: TFile, fileCache: CachedMetadata|null=null) {
		const file = this.fileMetaFromTFile(f)
		file.preview = await this.getFilePreview(f)
		file.tags = this.getFileTags(f)
		return file
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
		const files: FileMeta[] = []
		const fs = this.app.vault.getMarkdownFiles()
		for (let f of fs) {
			if (pathsInScope.size === 0 || pathsInScope.has(getParentPath(f))) {
				// FUTURE: inflate only the files that will render in the viewport?
				// Need tags for all files in scope but previews only for viewport...
				const file = await this.inflatedFileMetaFromTFile(f)
				files.push(file)
			}
		} 		
		if (files.length) {
			store.dispatch(loadFiles(files))
		}
	}

	// FUTURE: Make sure this works with .canvas - it almost does now
	async createFile(parentPath: string = '', type='md') {
		const name = `${moment().format('YYYY-MM-DD HH-mm-ss')}.${type}`
		let path = parentPath
			? parentPath
			: this.app.workspace.getActiveFile()?.parent.path
		let createdFile: TFile
		if (path) {
			createdFile = await this.app.vault.create(`${path}/${name}`, '')
		}
		else {
			createdFile = await this.app.vault.create(name, '')
		}
		this.openFile(createdFile, true)
	}

	async createFolder(parentPath: string = '') {
		const name = moment().format('YYYY-MM-DD HH-mm-ss')
		const newFolderPath = parentPath
			? `${parentPath}/${name}`
			: name
		await this.app.vault.createFolder(newFolderPath)
		store.dispatch(awaitRenameFolder(newFolderPath))
	}

	async renameFileOrFolder(path: string, newPath: string) {
		const f = this.app.vault.getAbstractFileByPath(path)!
		// Rename and update all links to file according to user preferences
		if (f instanceof TFile) {
			this.app.fileManager.renameFile(f, newPath)
		}
		else {
			this.app.vault.rename(f, newPath)
		}
	}

	openFile(f: TFile | FileMeta, renameOnOpen: boolean = false, pane?: PaneType | boolean) {
		if ('preview' in f) {
			// Convert from FileMeta to TFile
			f = this.app.vault.getAbstractFileByPath(f.path) as TFile
		}
		let fileLeaf: WorkspaceLeaf
		if (pane) {
			fileLeaf = this.app.workspace.getLeaf(pane)
		}
		else {
			fileLeaf = this.app.workspace.getLeaf()
		}
		if (renameOnOpen) {
			// on 'file-open' the title will be selected for renaming
			// and this.renameNextFileOpened will be cleared
			this.renameNextFileOpened = true
		}
		fileLeaf.openFile(f)
	}

	async search(paths: string[], query: string, matchCase=false) {
		store.dispatch(requestSearchResults())
		try {
			const files = paths.map(path => this.app.vault.getAbstractFileByPath(path))
			const tokens = query.split(' ').map(t => t.trim())
			const flags = matchCase ? 'g' : 'ig'
			const results: FileMeta[] = []
			for (let file of files) {
				if (file && file instanceof TFile) {
					const contents = await app.vault.cachedRead(file)
					let totalMatches = 0
					let matchedAllTokens = true
					for (let token of tokens) {
						const regex = RegExp(token, flags)
						const titleMatches = file.name.match(regex)
						const matches = contents.match(regex)
						const numMatches = (titleMatches ? titleMatches.length : 0) + (matches ? matches.length : 0)
						matchedAllTokens = matchedAllTokens && numMatches > 0
						totalMatches += numMatches
					}
					if (matchedAllTokens) {
						const result = this.fileMetaFromTFile(file)
						result.preview = totalMatches === 1
							? 'Contains 1 match'
							: `Contains ${totalMatches} matches`
						result.tags = this.getFileTags(file)
						results.push(result)
					}
				}
			}
			store.dispatch(fulfillSearchResults(results))
		}
		catch(error: unknown) {
			const message = error instanceof Error
				? error.message
				: 'Unknown error'
			store.dispatch(failSearchResults(message))
		}
	}	
}
