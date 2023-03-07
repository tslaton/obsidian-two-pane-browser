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
  clearTagFilters, 
} from '../tags/tagFiltersSlice'

export default function TagFiltersContainer() {
  const dispatch = useAppDispatch()
  const tagCategoryFilters = useAppSelector(selectTagCategoryFiltersInScope)
  const tagFilters = useAppSelector(selectTagFiltersInScope)
  const anyTagFiltersAreApplied = useAppSelector(selectAnyTagFiltersAreApplied)

  // Reset the filters when the tagsInScope change
  // Remove activeCategories/include/excludeTags that aren't in scope
  // React.useEffect(() => {
  //   dispatch(clearTagFilters())
  // }, [tagsInScope])

  function onClickClearTagFilters() {
    dispatch(clearTagFilters())
  }

  return (
    <StyledTagFiltersContainer>
      <div className="tag-filters-flex-controls">
        <label htmlFor="tag-filter-options">Match:</label>
        <select id="tag-filter-options">
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
            style={tcf.style}
            isActive={tcf.isActive} 
            size={8} 
          />  
        )}
        {tagFilters.map(tf => 
          <Tag
            key={tf.name} 
            name={tf.name}
            style={tf.style}
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
  }

  .tag-filters-flex-container {
    display: flex;
    flex-direction: horizontal;
    flex-wrap: wrap;
    gap: 4px;
    padding: 2px 2px;
  }
`
