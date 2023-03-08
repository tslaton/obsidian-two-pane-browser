// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { SearchIcon, EditIcon, TagsIcon, SortAscIcon, SortDescIcon } from 'lucide-react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import SortOptionsContextMenu from './SortOptionsContextMenu'
import { selectSearchQuery, selectSortOption, clearSearchQuery } from '../search/searchSlice'
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
  const showTagFilters = !!activeOptions.find(option => option.id === 'show-tag-filters')?.isActive
  const query = useAppSelector(selectSearchQuery)

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

  function clearQuery() {
    dispatch(clearSearchQuery())
  }

  function toggleShowTagFilters() {
    dispatch(toggleSearchOption('show-tag-filters'))
  }

  return (
    <StyledSearch { ...{ showSearch, showTagFilters } }>
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
              <input 
                type="search" 
                name="scoped-search"
                placeholder="Type to start search..."
                value={query}
                onChange={onChangeQuery} 
              />
              {query && <div className="search-input-clear-button" onClick={clearQuery} />}
            </div>
            <div className="clickable-icon" onClick={toggleShowTagFilters}>
              <TagsIcon size={22} />
            </div>
          </div>
          {showTagFilters && <TagFiltersContainer />}
          <hr />
        </>
      }
    </StyledSearch>
  )
}

interface StyledSearchProps {
  showSearch: boolean
  showTagFilters: boolean
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
    gap: 4px;

    .search-input-container {
      width: 100%;
    }
  }

  .lucide-search {
    color: ${props => props.showSearch ? 'var(--color-accent)' : 'inherit'};
  }
  
  .lucide-tags {
    color: ${props => props.showTagFilters ? 'var(--color-accent)' : 'inherit'};
  }
`
