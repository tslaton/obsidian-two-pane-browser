// Libraries
import { App, PluginSettingTab, Setting, debounce } from 'obsidian'
// Modules
import type TwoPaneBrowserPlugin from '../../main'
import store from '../../plugin/store'
import { TwoPaneBrowserSettings } from './settingsSlice'
import { tagStyles, createTagStyle } from '../../features/tags/Tag'
import { deepcopy } from '../../utils'

export default class TwoPaneBrowserSettingTab extends PluginSettingTab {
	plugin: TwoPaneBrowserPlugin
	draftSettings: TwoPaneBrowserSettings
	debouncedSaveSettings

	constructor(app: App, plugin: TwoPaneBrowserPlugin) {
		super(app, plugin)
		this.plugin = plugin
		this.draftSettings = deepcopy(store.getState()).settings
		this.debouncedSaveSettings = debounce(
			async () => { await this.plugin.saveSettings(deepcopy(this.draftSettings)) }, 1000, true
		)

	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()
		containerEl.createEl('h2', { text: 'Settings for Two-Pane Browser '})
		containerEl.createEl('h3', { text: 'Tag colors' })

		for (let styleName of Object.keys(this.draftSettings.tagsByStyleName)) {
			const setting = new Setting(containerEl)
				.setName(styleName)
				.setDesc('Tags listed here receive this style. Separate them by spaces.')
				.addTextArea(textArea => {
					textArea
						.setPlaceholder('Enter tags, including #')
						.setValue(this.draftSettings.tagsByStyleName[styleName])
						.onChange(async (value) => {
							this.draftSettings.tagsByStyleName[styleName] = value
							this.debouncedSaveSettings()							
						})
					textArea.inputEl.cols = 60
					textArea.inputEl.rows = 8
				})
			// Style the setting like the tag
			const nameEl = setting.nameEl
			// @ts-ignore
			let style = createTagStyle(tagStyles[styleName])
			nameEl.innerHTML = `<span style="${style}">${nameEl.innerHTML}</span>`
		}
	}
}
