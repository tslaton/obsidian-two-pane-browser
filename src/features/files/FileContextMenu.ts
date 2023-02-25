// Libraries
import { Menu } from 'obsidian'
// Modules
import type TwoPaneBrowserPlugin from '../../main'
import store from '../../plugin/store'
import { FileMeta, awaitRenameFile } from './filesSlice'

export default function FileContextMenu(file: FileMeta, plugin: TwoPaneBrowserPlugin) {
  // Ref: https://marcus.se.net/obsidian-plugin-docs/user-interface/context-menus 
  const menu = new Menu()

  menu.addItem(item => item
    .setTitle('Open in new tab')
    .onClick(() => {
      plugin.openFile(file, false, 'tab')
    })  
  )
  menu.addItem(item => item
    .setTitle('Open to the right')
    .onClick(() => {
      plugin.openFile(file, false, 'split')
    })  
  )
  menu.addItem(item => item
    .setTitle('Open in new window')
    .onClick(() => {
      plugin.openFile(file, false, 'window')
    })  
  )
  menu.addSeparator()
  menu.addItem(item => item
    .setTitle('Rename')
    .onClick(() => {
      throw new Error('Need to implement in FilePreview.tsx')
      // store.dispatch(awaitRenameFile(file.path))
    })  
  )
  // Make a copy
  // Move file to...
  // Star
  // Merge entire file with...
  menu.addSeparator()
  menu.addItem(item => item
    .setTitle('Open in default app')
    .onClick(() => {
      // @ts-ignore
      plugin.app.openWithDefaultApp(file.path)
    })  
  )
  menu.addItem(item => item
    .setTitle('Reveal in system browser')
    .onClick(() => {
      // @ts-ignore
      plugin.app.showInFolder(file.path)
    })
  )
  menu.addSeparator()
  menu.addItem(item => item
    .setTitle('Copy Obsidian URL')
    .onClick(() => {
      const vault = plugin.app.vault.getName()
      const uri = `obsidian://vault/${vault}/${file.path}`
      navigator.clipboard.writeText(uri)
    })  
  )
  menu.addSeparator()
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
