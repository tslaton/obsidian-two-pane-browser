// Libraries
import { create } from 'domain'
import { App, PluginSettingTab, Setting } from 'obsidian'
import { createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'
// Modules
import type TwoPaneBrowserPlugin from './main'

export const tagColors = {
	'berry-red': { pill: '#b8256f', text: 'white' },
	'red': { pill: '#db4035', text: 'white' },
	'orange': { pill: '#ff9933', text: 'black' },
	'yellow': { pill: '#fad000', 'text': 'black' },
	'olive-green': { pill: '#afb83b', text: 'black' },
	'lime-green': { pill: '#7ecc49', text: 'black' },
	'green': { pill: '#299438', text: 'white' },
	'mint-green': { pill: '#6accbc', text: 'black' },
	'teal': { pill: '#158fad', text: 'white' },
	'sky-blue': { pill: '#14aaf5', text: 'white' },
	'light-blue': { pill: '#96c3eb', text: 'black' },
	'blue': { pill: '#4073ff', text: 'white' },
	'grape': { pill: '#884dff', text: 'white' },
	'violet': { pill: '##af38eb', text: 'white' },
	'lavender': { pill: '#eb96eb', text: 'black' },
	'magenta': { pill: '#e05194', text: 'white' },
	'salmon': { pill: '#ff8d85', text: 'black' },
	'charcoal': { pill: '#808080', text: 'white' },
	'gray': { pill: '#b8b8b8', text: 'black' },
	'taupe': { pill: '#ccac93', text: 'black' },
}

export const DEFAULT_SETTINGS = {
	tagsByColorName: Object.fromEntries(
		Object.keys(tagColors).map(colorName => [colorName, ''])
	),
}
export type TwoPaneBrowserSettings = typeof DEFAULT_SETTINGS

//
export const store = createStore({
  settings: DEFAULT_SETTINGS,
  files: ['hello.md'],
})
const [state, setState] = store

// setInterval(() => { 
// 	console.log('interval... settings: ', state.settings)
//  }, 2000)


createEffect(() => {
	console.log('effect... settings: ', state.settings.tagsByColorName)
})
//

export class TwoPaneBrowserSettingTab extends PluginSettingTab {
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
						// .setValue(this.plugin.settings.tagsByColorName[colorName])
						.setValue(state.settings.tagsByColorName[colorName])
						.onChange(async (value) => {
							// this.plugin.settings.tagsByColorName[colorName] = value
							setState('settings', { ...state.settings.tagsByColorName, [colorName]: value })
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
