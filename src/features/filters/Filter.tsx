// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { FilterMeta, activateFilter } from '../../features/filters/filtersSlice'
import { deselectAllFolders } from '../folders/foldersSlice'
import { selectFileCountsByFilter } from '../files/filesSlice'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import ObsidianIcon from '../../common/ObsidianIcon'

// NOTE: Currently pretty similar/redundant to Folder
export default function Filter(filter: FilterMeta) {  
  const dispatch = useAppDispatch()
  const fileCountsByFilter = useAppSelector(selectFileCountsByFilter)
  const fileCount = fileCountsByFilter[filter.id]!

  function onClick() {
    dispatch(activateFilter(filter.id))
    dispatch(deselectAllFolders())
  }

  const iconMap: Record<string, string> = {
    all: 'folders',
    inbox: 'inbox',
    recents: 'history',
  }
  const iconName = iconMap[filter.id] || 'filter'
  
  return (
    <StyledFilter
      className={`nav-item ${filter.isActive ? 'is-active' : ''}`}
      onClick={onClick}
      {...filter} 
    >
      <ObsidianIcon iconName={iconName} />
      <div className="filter-name">
        {filter.name}
      </div>
      <div className="file-count">
        {fileCount}
      </div>
    </StyledFilter>
  )
}

const StyledFilter = styled.div<FilterMeta>`  
  display: flex;
  flex-direction: horizontal;
  padding: 10px;
  border-radius: 4px;

  .filter-name {
    line-height: 24px;
    flex: 1;
  }

  .file-count {
    line-height: 24px;
    color: var(--text-faint);
  }
`