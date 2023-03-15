// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import { useAppSelector, useAppDispatch } from '../../plugin/hooks'
import TagCategory from '../tags/TagCategory'
import Tag from '../tags/Tag'
import { 
  selectTagCategoryFiltersInScope, selectTagFiltersInScope, selectAnyTagFiltersAreApplied,
  selectTagCategoryNamesInScope, selectTagNamesInScope, selectMatchMode, updateMatchMode,
  reconcileActiveTagCategoryNames, reconcileFilteredTagNames, clearTagFilters, 
} from '../tags/tagFiltersSlice'
import ObsidianIcon from '../../common/ObsidianIcon'

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
    <div css={styles.self}>
      <div className="tag-filters-flex-controls">
        <label htmlFor="tag-filter-options">Match:</label>
        <select id="tag-filter-options" value={matchMode} onChange={onChangeMatchMode}>
          <option value="all">All Selected</option>
          <option value="any">Any Selected</option>
        </select>
        {anyTagFiltersAreApplied &&
          <ObsidianIcon title="Clear tag filters" iconName="x" onClick={onClickClearTagFilters} />
        }
      </div>
      <div className="tag-filters-flex-container">
        {tagCategoryFilters.length > 1 && tagCategoryFilters.map(tcf => 
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
    </div>
  )
}

const styles = {
  self: css`
    label[for="tag-filter-options"] {
      display: block;
    }

    #tag-filter-options {
      background: none;
      box-shadow: none;
      appearance: auto;

      &:hover {
        background-color: var(--nav-item-background-hover);
      }
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
}
