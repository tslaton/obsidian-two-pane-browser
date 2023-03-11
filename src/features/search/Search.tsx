// Libraries
import { debounce } from 'obsidian'
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import ObsidianIcon from '../../common/ObsidianIcon'
import SortOptionsContextMenu from './SortOptionsContextMenu'
import { selectSearchQuery, selectSortOption, clearSearchQuery, setSearchInputHasFocus} from '../search/searchSlice'
import { selectSearchOptions, toggleShowSearch, toggleShowTagFilters, toggleMatchCase, updateSearchQuery } from '../search/searchSlice'
import TagFiltersContainer from '../tags/TagFiltersContainer'
import { selectFilesInScope } from '../files/filesSlice'

export function Search() {
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const query = useAppSelector(selectSearchQuery)
  const searchOptions = useAppSelector(selectSearchOptions)
  const matchCaseOn = searchOptions.matchCase.isActive
  const showTagFilters = searchOptions.showTagFilters.isActive
  const filesInScope = useAppSelector(selectFilesInScope)
  const filePathsInScope = filesInScope.map(f => f.path)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    searchInputRef.current!.focus()
  }, [])

  const debouncedExecuteSearch = debounce((currentQuery: string) => {
    if (currentQuery) {
      plugin.search(filePathsInScope, currentQuery, matchCaseOn)
    }
  }, 500, true)

  function onChangeQuery(event: React.ChangeEvent<HTMLInputElement>) {
    const currentQuery = event.target.value
    dispatch(updateSearchQuery(currentQuery))
    debouncedExecuteSearch(currentQuery)
  }

  function onClickClearQuery() {
    dispatch(clearSearchQuery())
  }

  function onSubmitQuery(event: React.FormEvent) {
    event.preventDefault()
    plugin.search(filePathsInScope, query, matchCaseOn)
  }

  function onFocusSearchInput(event: React.FocusEvent) {
    dispatch(setSearchInputHasFocus(true))
  }

  function onBlurSearchInput(event: React.FocusEvent) {
    dispatch(setSearchInputHasFocus(false))
  }

  function onClickShowTagFilters() {
    dispatch(toggleShowTagFilters())
  }

  return (
    <>
      <div className="search-flex-wrapper">
        <div className="search-input-container">
          <form onSubmit={onSubmitQuery}>
            <input 
              type="search" 
              name="scoped-search"
              placeholder="Type to start search..."
              value={query}
              onChange={onChangeQuery}
              onFocus={onFocusSearchInput}
              onBlur={onBlurSearchInput}
              ref={searchInputRef}
            />
          </form>
          {query && <div className="search-input-clear-button" onClick={onClickClearQuery} />}
        </div>
        <ObsidianIcon iconName="tags" size={22} isActive={showTagFilters} onClick={onClickShowTagFilters} />
      </div>
      {showTagFilters && <TagFiltersContainer />}
    </>
  )
}

export default function SearchContainer() {
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const sortOption = useAppSelector(selectSortOption)
  const sortIconName = sortOption.direction === 'asc' ? 'sort-asc' : 'sort-desc'
  const searchOptions = useAppSelector(selectSearchOptions)
  const showSearch = searchOptions.showSearch.isActive
  const showTagFilters = searchOptions.showTagFilters.isActive
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
    <StyledSearchContainer { ...{ showSearch, showTagFilters, matchCaseOn } }>
      <div className="button-bar">
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
      {showSearch &&
        <>
          <Search />
          <hr />
        </>
      }
    </StyledSearchContainer>
  )
}

interface StyledSearchProps {
  showSearch: boolean
  showTagFilters: boolean
  matchCaseOn: boolean
}

const StyledSearchContainer = styled.div<StyledSearchProps>`
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
`
