// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { XIcon } from 'lucide-react'
// Modules
import { useAppSelector, useAppDispatch } from '../../plugin/hooks'
import TagCategory from '../tags/TagCategory'
import Tag from '../tags/Tag'
import { 
  selectTagCategoryFiltersInScope, selectTagFiltersInScope, selectAnyTagFiltersAreApplied,
  selectTagCategoryNamesInScope, selectTagNamesInScope, selectMatchMode, updateMatchMode,
  reconcileActiveTagCategoryNames, reconcileFilteredTagNames, clearTagFilters, 
} from '../tags/tagFiltersSlice'

export default function TagFiltersContainer() {
  const dispatch = useAppDispatch()
  const tagCategoryFilters = useAppSelector(selectTagCategoryFiltersInScope)
  const tagFilters = useAppSelector(selectTagFiltersInScope)
  const anyTagFiltersAreApplied = useAppSelector(selectAnyTagFiltersAreApplied)
  const matchMode = useAppSelector(selectMatchMode)

  // Clean up state for tags that leave scope
  const tagCategoryNamesInScope = useAppSelector(selectTagCategoryNamesInScope)
  React.useEffect(() => {
    dispatch(reconcileActiveTagCategoryNames(tagCategoryNamesInScope))
  }, [tagCategoryNamesInScope])

  const tagNamesInScope = useAppSelector(selectTagNamesInScope)
  React.useEffect(() => {
    dispatch(reconcileFilteredTagNames(tagNamesInScope))
  }, [tagNamesInScope])

  function onClickClearTagFilters() {
    dispatch(clearTagFilters())
  }

  function onChangeMatchMode(event: React.ChangeEvent<HTMLSelectElement>) {
    const newMatchMode = event.target.value as 'any' | 'all'
    dispatch(updateMatchMode(newMatchMode))
  }

  return (
    <StyledTagFiltersContainer>
      <div className="tag-filters-flex-controls">
        <label htmlFor="tag-filter-options">Match:</label>
        <select id="tag-filter-options" value={matchMode} onChange={onChangeMatchMode}>
          <option value="all">All Selected</option>
          <option value="any">Any Selected</option>
        </select>
        {anyTagFiltersAreApplied &&
          <div title="Clear tag filters" className="clickable-icon" onClick={onClickClearTagFilters}>
            <XIcon size={18} />
          </div>
        }
      </div>
      <div className="tag-filters-flex-container">
        {tagCategoryFilters.map(tcf => 
          <TagCategory
            key={tcf.name}
            name={tcf.name}
            color={tcf.color}
            isActive={tcf.isActive} 
          />  
        )}
        {tagFilters.map(tf => 
          <Tag
            key={tf.name} 
            name={tf.name}
            color={tf.color}
            status={tf.status}
          />
        )}
      </div>
    </StyledTagFiltersContainer>
  )
}

const StyledTagFiltersContainer = styled.div`
  label[for="tag-filter-options"] {
    display: block;
  }

  #tag-filter-options {
    background: none;
    box-shadow: none;
    appearance: auto;
  }

  .tag-filters-flex-controls {
    display: flex;
    flex-direction: horizontal;
    align-items: center;
    padding: 2px 2px;
    gap: 4px;
  }

  .tag-filters-flex-container {
    display: flex;
    flex-direction: horizontal;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 4px;
    row-gap: 8px;
    padding: 2px 2px;
  }
`
