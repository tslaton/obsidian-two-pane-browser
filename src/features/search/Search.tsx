// Libraries
import { debounce } from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import ObsidianIcon from '../../common/ObsidianIcon'
import { 
  selectSearchQuery, selectSearchOptions, setSearchInputHasFocus,
  toggleShowTagFilters, updateSearchQuery
} from '../search/searchSlice'
import { clearSearchResults } from './extraActions'
import TagFiltersContainer from '../tags/TagFiltersContainer'
import { selectFilesInScope } from '../files/filesSlice'

export default function Search() {
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
    plugin.search(filePathsInScope, currentQuery, matchCaseOn)
  }, 500, true)

  function onChangeQuery(event: React.ChangeEvent<HTMLInputElement>) {
    const currentQuery = event.target.value
    dispatch(updateSearchQuery(currentQuery))
    if (currentQuery) {
      debouncedExecuteSearch(currentQuery)
    }
    else {
      dispatch(clearSearchResults())
    }
  }

  function onClickClearQuery() {
    dispatch(clearSearchResults())
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
    <div css={styles}>
      <div className="search-flex-container">
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
      <hr />
    </div>
  )
}

const styles = css`
  .search-flex-container {
    display: flex;
    flex-direction: horizontal;
    gap: 4px;

    .search-input-container {
      width: 100%;
    }
  }

  hr {
    border-color: var(--divider-color);
    border-width: var(--divider-width);
    margin: 7.5px -12px;
  }
`
