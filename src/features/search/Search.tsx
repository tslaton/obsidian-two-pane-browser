// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { TagsIcon } from 'lucide-react'
// Modules
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import { selectQuery, updateQuery } from '../search/searchSlice'
import { selectActiveToggles, toggleToggle } from '../toggles/togglesSlice'

export default function Search() {
  const dispatch = useAppDispatch()
  const query = useAppSelector(selectQuery)
  const activeToggles = useAppSelector(selectActiveToggles)
  const showTagFilters = !!activeToggles.find(toggle => toggle.id === 'show-tags')?.isActive
  
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch(updateQuery(event.target.value))
  }
  
  function toggleShowTags() {
    dispatch(toggleToggle('show-tags'))
  }

  return (
    <StyledSearch>
      <div className="search-flex-wrapper">
        <div className="search-input-container">
          <input name="scoped-search" value={query} onChange={onChange} />
        </div>
        <div className="clickable-icon" onClick={toggleShowTags}>
          <TagsIcon size={18} />
        </div>
      </div>
      {showTagFilters && <div>tags go here</div>}
    </StyledSearch>
  )
}

const StyledSearch = styled.div`
  .search-flex-wrapper {
    display: flex;
    flex-direction: horizontal;
  }
`
