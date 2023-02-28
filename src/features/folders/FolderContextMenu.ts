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
  menu.addItem(item => item
    .setTitle('Set as attachment folder')
    .onClick(() => {
      // @ts-ignore
      plugin.app.setAttachmentFolder(folder)
    })
  )
  menu.addItem(item => item
    .setTitle('Rename')
    .onClick(() => {
      store.dispatch(awaitRenameFolder(folder.path))
    })  
  )
  // menu.addItem(item => item
  //   .setTitle('Move folder to...')
  //   .onClick(() => {
  //     console.log(plugin.app)
  //   })
  // )
  menu.addSeparator()
  menu.addItem(item => item
    .setTitle('Reveal in system browser')
    .onClick(() => {
      // @ts-ignore
      plugin.app.showInFolder(folder.path)
    })
  )
  menu.addSeparator()
  // menu.addItem(item => item
  //   .setTitle('New canvas')
  //   .onClick(() => {
  //     plugin.createFile(folder.path, 'canvas')
  //   })  
  // )
  // menu.addSeparator()
  menu.addItem(item => item
    .setTitle('Delete')
    .onClick(() => {
      const f = plugin.app.vault.getAbstractFileByPath(folder.path)
      // @ts-ignore
      plugin.app.fileManager.promptForDeletion(f)
    }) 
  )

  return menu
}
