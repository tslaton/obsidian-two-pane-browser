// Libraries
import { Menu } from 'obsidian'
// Modules
import type TwoPaneBrowserPlugin from '../../main'
import { FileMeta } from './filesSlice'

export default function FileContextMenu(file: FileMeta, plugin: TwoPaneBrowserPlugin) {
  // Ref: https://marcus.se.net/obsidian-plugin-docs/user-interface/context-menus 
  const menu = new Menu()

  // Open in new tab
  // Open to the right
  // Open in new window
  // menu.addSeparator()
  // Rename
  // Make a copy
  // Move file to...
  // Star
  // Merge entire file with...
  // menu.addSeparator()
  // Open in default app
  // Reveal in Finder
  // menu.addSeparator()
  // Copy Obsidian URL
  // menu.addSeparator()

  menu.addItem(item => item
    .setTitle('Delete')
    .onClick(() => {
      plugin.deleteFileOrFolder(file.path)
    }) 
  )

  return menu
}

// ComboMenu:
// Move (n) files and (m) folders to...
// ---
// Delete
