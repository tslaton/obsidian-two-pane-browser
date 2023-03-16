// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import ObsidianIcon from '../../common/ObsidianIcon'
import SortOptionsContextMenu from './SortOptionsContextMenu'
import { 
  selectSearchOptions, selectSortOption,
  toggleShowSearch, toggleMatchCase,
} from '../search/searchSlice'

export default function SearchControls() {
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const sortOption = useAppSelector(selectSortOption)
  const sortIconName = sortOption.direction === 'asc' ? 'sort-asc' : 'sort-desc'
  const searchOptions = useAppSelector(selectSearchOptions)
  const showSearch = searchOptions.showSearch.isActive
  const matchCaseOn = searchOptions.matchCase.isActive

  function showSortOptionsContextMenu(event: React.MouseEvent) {
    const menu = SortOptionsContextMenu(sortOption)
    menu.showAtMouseEvent(event.nativeEvent)
  }

  function onClickShowSearch() {
    dispatch(toggleShowSearch())
  }

  function onClickMatchCase() {
    dispatch(toggleMatchCase())
  }

  function onClickCreateFile() {
    plugin.createFile()
  }

  return (
    <div css={styles}>
      <ObsidianIcon iconName={sortIconName} size={20} onClick={showSortOptionsContextMenu} />
      {showSearch &&
        <ObsidianIcon
          iconName="uppercase-lowercase-a"
          size={20}
          isActive={matchCaseOn}
          onClick={onClickMatchCase}
        />
      }
      <ObsidianIcon iconName="search" size={20} isActive={showSearch} onClick={onClickShowSearch} />
      <ObsidianIcon iconName="edit" size={20} onClick={onClickCreateFile} />
    </div>
  )
}

const styles = css`
  display: flex;
  flex-direction: horizontal;
  justify-content: flex-end;
  padding: 10px 0;
`
