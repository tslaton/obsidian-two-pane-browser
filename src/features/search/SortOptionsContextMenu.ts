// Libraries
import { Menu } from 'obsidian'
// Modules
import store from '../../plugin/store'
import { SortOption, setSortOption } from './searchSlice'

function isEqual(a: SortOption, b: SortOption) {
  return a.property === b.property && a.direction === b.direction
}

export default function SortOptionsContextMenu(selectedOption: SortOption) {
  // Ref: https://marcus.se.net/obsidian-plugin-docs/user-interface/context-menus 
  const menu = new Menu()

  function addSortOptionMenuItem(name: string, option: SortOption) {
    menu.addItem(item => item
      .setChecked(isEqual(option, selectedOption))
      .setTitle(name)
      .onClick(() => {
        store.dispatch(setSortOption(option))
      })
    )
  }

  addSortOptionMenuItem('File name (A to Z)', { property: 'filename', direction: 'asc' })
  addSortOptionMenuItem('File name (Z to A)', { property: 'filename', direction: 'desc' })
  menu.addSeparator()
  addSortOptionMenuItem('Modified time (new to old)', { property: 'mtime', direction: 'desc' })
  addSortOptionMenuItem('Modified time (old to new)', { property: 'mtime', direction: 'asc' })
  menu.addSeparator()
  addSortOptionMenuItem('Created time (new to old)', { property: 'ctime', direction: 'desc' })
  addSortOptionMenuItem('Created time (old to new)', { property: 'ctime', direction: 'asc' })

  return menu
}