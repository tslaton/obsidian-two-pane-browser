// Libraries
import { Menu } from 'obsidian'
// Modules
import type TwoPaneBrowserPlugin from '../../main'
import store from '../../plugin/store'
import { FolderMeta, awaitRenameFolder } from './foldersSlice'

export default function FolderContextMenu(folder: FolderMeta, plugin: TwoPaneBrowserPlugin) {
  // Ref: https://marcus.se.net/obsidian-plugin-docs/user-interface/context-menus 
  const menu = new Menu()

  menu.addItem(item => item
    .setTitle('New note')
    .onClick(() => {
      plugin.createFile(folder.path)
    })    
  )
  menu.addItem(item => item
    .setTitle('New folder')
    .onClick(() => {
      plugin.createFolder(folder.path)
    })  
  )
  // Set as attachment folder
  menu.addItem(item => item
    .setTitle('Rename')
    .onClick(() => {
      store.dispatch(awaitRenameFolder(folder.path))
    })  
  )
  // Move folder to...
  // menu.addSeparator()
  // Reveal in Finder
  // menu.addSeparator()
  // New canvas
  menu.addSeparator()
  menu.addItem(item => item
    .setTitle('Delete')
    .onClick(() => {
      plugin.deleteFileOrFolder(folder.path)
    }) 
  )

  return menu
}
