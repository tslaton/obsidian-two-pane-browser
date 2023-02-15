// Libraries
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian'
// Modules
import TwoPaneBrowserView, { TWO_PANE_BROWSER_VIEW } from './view'
import { TwoPaneBrowserSettings, DEFAULT_SETTINGS, tagColors } from './settings'

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
			leaf => new TwoPaneBrowserView(leaf, this.settings)
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
		containerEl.createEl('h2', { text: 'Settings for Two-Pane Browser '})
		containerEl.createEl('h3', { text: 'Tag colors' })

		for (let colorName of Object.keys(tagColors)) {
			const setting = new Setting(containerEl)
				.setName(colorName)
				.setDesc('Tags listed here receive this style. Separate them by spaces.')
				.addTextArea(textArea => {
					textArea
						.setPlaceholder('Enter tags, including #')
						.setValue(this.plugin.settings.tagsByColorName[colorName])
						.onChange(async (value) => {
							this.plugin.settings.tagsByColorName[colorName] = value
							await this.plugin.saveSettings()
						})
					textArea.inputEl.cols = 60
					textArea.inputEl.rows = 8
				})
			// Style the setting like the tag
			const nameEl = setting.nameEl
			// @ts-ignore
			const { pill, text } = tagColors[colorName]
			let style = `
				color: ${text}; 
				background-color: ${pill};
				padding: 0px 8px 2px 8px;
				border-radius: 10px;
			`
			nameEl.innerHTML = `<span style="${style}">${nameEl.innerHTML}</span>`
		}
	}
}
