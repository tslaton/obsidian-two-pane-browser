// Libraries
import { debounce } from 'obsidian'
import * as React from 'react'
import styled from '@emotion/styled'
import { SearchIcon, FilePlus2Icon, TagsIcon } from 'lucide-react'
// Modules
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import { selectActiveSearchOptions, toggleSearchOption, updateSearchQuery } from '../search/searchSlice'

export default function Search() {
  const dispatch = useAppDispatch()
  const activeOptions = useAppSelector(selectActiveSearchOptions)
  const showSearch = !!activeOptions.find(option => option.id === 'show-search')?.isActive
  const showTags = !!activeOptions.find(option => option.id === 'show-tags')?.isActive

  function toggleShowSearch() {
    dispatch(toggleSearchOption('show-search'))
  }

  function createNewDocument() {
    console.log('createNewDocument called...')
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
        <div className="clickable-icon" onClick={toggleShowSearch}>
          <SearchIcon size={20} />
        </div>
        <div className="clickable-icon" onClick={createNewDocument}>
          <FilePlus2Icon size={20} />
        </div>
      </div>
      {showSearch &&
        <>
          <div className="search-flex-wrapper">
            <div className="search-input-container">
              <input name="scoped-search" onChange={debouncedUpdateSearchQuery} />
            </div>
            <div className="clickable-icon" onClick={toggleShowTags}>
              <TagsIcon size={22} />
            </div>
          </div>
          {showTags && <div>tags go here</div>}
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

      input {
        height: 2.2em;
        background-color: var(--background-modifier-form-field);
        border-style: solid;
        border-color: var(--divider-color);
        border-width: calc(2*var(--divider-width));
        box-shadow: none;
        border-radius: 4px;
      }
    }
  }

  .lucide-search {
    color: ${props => props.showSearch ? 'var(--color-accent)' : 'inherit'};
  }
  
  .lucide-tags {
    color: ${props => props.showTags ? 'var(--color-accent)' : 'inherit'};
  }

`
