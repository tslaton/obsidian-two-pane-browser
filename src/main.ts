// Libraries
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
// Modules
import TwoPaneBrowserView, { TWO_PANE_BROWSER_VIEW } from 'src/view'

// Settings
interface TwoPaneBrowserSettings {
	mySetting: string
}
const DEFAULT_SETTINGS: TwoPaneBrowserSettings = {
	mySetting: 'default'
}

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

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-two-pane-browser',
			name: 'Open Two Pane Browser',
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "m" }],
			callback: () => {
				// TODO
				console.log('called open-two-pane-browser')
			}
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TwoPaneBrowserSettingTab(this.app, this))

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// TODO: refresh the tag and file lists periodically? Or on change?
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000))
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TWO_PANE_BROWSER_VIEW)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}

class TwoPaneBrowserSettingTab extends PluginSettingTab {
	plugin: TwoPaneBrowserPlugin

	constructor(app: App, plugin: TwoPaneBrowserPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()
		containerEl.createEl('h2', {text: 'Settings for Two-Pane Browser'})

		// TODO: replae with real settings
		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value)
					this.plugin.settings.mySetting = value
					await this.plugin.saveSettings()
				}))
	}
}
