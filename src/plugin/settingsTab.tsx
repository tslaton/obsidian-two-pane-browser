// Libraries
import { App, PluginSettingTab } from 'obsidian'
import * as React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
// Modules
import PluginContext from './PluginContext'
import type TwoPaneBrowserPlugin from '../main'
import store from './store'
import Settings from '../features/settings/Settings'

export default class TwoPaneBrowserSettingTab extends PluginSettingTab {
	root?: Root
	plugin

	constructor(app: App, plugin: TwoPaneBrowserPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		// TODO: unmount at a better time?
		//  At least make sure we only have one copy of React state floating around at a time
		this.root?.unmount()
		const { containerEl } = this
		containerEl.empty()
    this.root = createRoot(containerEl)
    this.root.render(
      <React.StrictMode>
        <PluginContext.Provider value={this.plugin}>
          <Provider store={store}>
						<Settings />
          </Provider>
        </PluginContext.Provider>
      </React.StrictMode>
    )
	}
}
