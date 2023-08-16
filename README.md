# Obsidian Two-Pane Browser

This plugin adds a two-pane browser to [Obsidian](https://obsidian.md). Instead of a file tree, starred documents, and search in separate sidebar tabs, this browser provides similar features and more in a single sidebar view.

Currently, this plugin only supports the desktop version of Obsidian.

## Features

### Folders | Left Pane

The left pane holds the folder tree. Unlike the standard file tree, the folder tree will only ever contain folders. You can select one or more folders to show all files descended from them in the right pane.

### File previews | Right Pane

The right pane shows files rendered as previews plus metadata, like their tags. Additionally, it allows you to perform query-based or tag-based searches to further filter the files in already in scope according to the selected folders or global filters.

### Tags | Right Pane

In Obsidian's core tags plugin, you see one list of tags across all of the files in your vault. Instead, when using this plugin, the tags you can use to filter your files are scoped to the folders or filters selected in the left pane. This can help keep different areas of your life a little more separate, even within one vault. Tags can also be assigned colors in the settings for the plugin. Colors can be a convenient way to categorize tags related to different areas. If you want to see all of your tags, use the `All` filter. Because you can use folders to namespace tags and colors to categorize them, you may not need to use hierarchical tags when using this plugin. In fact, using a flat tagging scheme can (a) look cleaner on file previews and (b) be more dynamically namespaced by changing the folders, filters, and tag colors in scope.

### Global filters | Left Pane

Global filters are a feature in the left pane that perform predefined or saved searches across all files in your library.

## Installation for development

- Create a new vault to keep your real files safe
- Create some files, folders, and tags as test data
- Clone this repo to the vault
- Run `npm i` or `yarn` to install dependencies
- Run `npm run dev` or `yarn run dev` to start compilation in watch mode
- The [hot-reload](https://github.com/pjeby/hot-reload) plugin can be installed alongside this one to make development faster

## API Documentation

See https://github.com/obsidianmd/obsidian-api

---

2023/08/16 update: I probably won't finish this, at least in its current form. The UI for tags showing up atop the note previews doesn't scale clearly, especially on mobile. Apps like Bear *don't even show any subtags* and do away with folders in favor of using only hierarchical tags. It would still improve Obsidian for my usage patterns if it were to bring the hierarchical tags front-and-center on desktop + mobile and show note previews instead of search results for tags (basically, implement the Bear sidebar instead of the Ulysses one x Bear).
