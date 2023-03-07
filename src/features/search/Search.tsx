// Libraries
import { debounce } from 'obsidian'
import * as React from 'react'
import styled from '@emotion/styled'
import { SearchIcon, EditIcon, TagsIcon, SortAscIcon, SortDescIcon } from 'lucide-react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import SortOptionsContextMenu from './SortOptionsContextMenu'
import { selectSortOption } from '../search/searchSlice'
import { selectActiveSearchOptions, toggleSearchOption, updateSearchQuery } from '../search/searchSlice'
import TagFiltersContainer from '../tags/TagFiltersContainer'

// For clicking tags: https://discord.com/channels/686053708261228577/840286264964022302/1077674157107576872
export default function Search() {
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const sortOption = useAppSelector(selectSortOption)
  const SortIcon = sortOption.direction === 'asc' ? SortAscIcon : SortDescIcon
  const activeOptions = useAppSelector(selectActiveSearchOptions)
  const showSearch = !!activeOptions.find(option => option.id === 'show-search')?.isActive
  const showTags = !!activeOptions.find(option => option.id === 'show-tags')?.isActive

  function showSortOptionsContextMenu(event: React.MouseEvent) {
    const menu = SortOptionsContextMenu(sortOption)
    menu.showAtMouseEvent(event.nativeEvent)
  }

  function toggleShowSearch() {
    dispatch(toggleSearchOption('show-search'))
  }

  function createNewDocument() {
    plugin.createFile()
  }

  function onChangeQuery(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch(updateSearchQuery(event.target.value))
  }
  const debouncedUpdateSearchQuery = debounce(onChangeQuery, 1000, true)

  function toggleShowTags() {
    dispatch(toggleSearchOption('show-tags'))
  }

  return (
    <StyledSearch {...{showSearch, showTags}}>
      <div className="button-bar">
        <div className="clickable-icon" onClick={showSortOptionsContextMenu}>
          <SortIcon size={20} />
        </div>
        <div className="clickable-icon" onClick={toggleShowSearch}>
          <SearchIcon size={20} />
        </div>
        <div className="clickable-icon" onClick={createNewDocument}>
          <EditIcon size={20} />
        </div>
      </div>
      {showSearch &&
        <>
          <div className="search-flex-wrapper">
            <div className="search-input-container">
              <input type="text" name="scoped-search" onChange={debouncedUpdateSearchQuery} />
            </div>
            <div className="clickable-icon" onClick={toggleShowTags}>
              <TagsIcon size={22} />
            </div>
          </div>
          {showTags && <TagFiltersContainer />}
          <hr />
        </>
      }
    </StyledSearch>
  )
}

interface StyledSearchProps {
  showSearch: boolean
  showTags: boolean
}

const StyledSearch = styled.div<StyledSearchProps>`
  hr {
    border-color: var(--divider-color);
    border-width: var(--divider-width);
    margin: 7.5px -12px;
  }
  
  .button-bar {
    display: flex;
    flex-direction: horizontal;
    justify-content: flex-end;
    padding: 10px 0;
  }

  .search-flex-wrapper {
    display: flex;
    flex-direction: horizontal;

    .search-input-container {
      width: 100%;
    }
  }

  .lucide-search {
    color: ${props => props.showSearch ? 'var(--color-accent)' : 'inherit'};
  }
  
  .lucide-tags {
    color: ${props => props.showTags ? 'var(--color-accent)' : 'inherit'};
  }
`
