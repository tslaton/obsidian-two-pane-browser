// Libraries
import { App, PluginSettingTab, Setting, debounce } from 'obsidian'
// Modules
import type TwoPaneBrowserPlugin from '../../main'
import store from '../../plugin/store'
import { TwoPaneBrowserSettings, selectSettings } from './settingsSlice'
import { tagStyles, createTagStyle } from '../../features/tags/Tag'

export default class TwoPaneBrowserSettingTab extends PluginSettingTab {
	plugin: TwoPaneBrowserPlugin
	draftSettings: TwoPaneBrowserSettings

	constructor(app: App, plugin: TwoPaneBrowserPlugin) {
		super(app, plugin)
		this.plugin = plugin
		this.draftSettings = selectSettings(store.getState())
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
							debounce(async () => { await this.plugin.saveSettings(this.draftSettings) }, 1000, true)
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
