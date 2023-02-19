// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { FoldersIcon, HistoryIcon, FilterIcon } from 'lucide-react'
// Modules
import { FilterMeta, selectFilter } from '../../features/filters/filtersSlice'
import { deselectAllFolders } from '../folders/foldersSlice'
import { useAppDispatch } from '../../plugin/hooks'

// NOTE: Currently pretty similar/redundant to Folder
export default function Filter(filter: FilterMeta) {  
  const dispatch = useAppDispatch()

  function toggleIsSelected() {
    dispatch(selectFilter(filter.id))
    dispatch(deselectAllFolders())
  }

  const Icon = (
    filter.id === 'all' ? 
      FoldersIcon : 
    filter.id === 'recents' ?
      HistoryIcon :
      FilterIcon
  )
  
  return (
    <StyledFilter {...filter} onClick={toggleIsSelected}>
      <div className="clickable-icon">
        <Icon size={18} />
      </div>
      <div className="filter-name">
        {filter.name}
      </div>
    </StyledFilter>
  )
}

const StyledFilter = styled.div<FilterMeta>`  
  display: flex;
  flex-direction: horizontal;
  padding: 10px;
  border-radius: 4px;
  background-color: ${filter => filter.isSelected ? '#333' : 'inherit' };

  .filter-name {
    line-height: 24px;
  }
`