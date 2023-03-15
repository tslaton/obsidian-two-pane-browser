// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
import classNames from 'classnames'
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
    <div
      className={classNames('nav-item', { 'is-active': filter.isActive })}
      css={styles.self}
      onClick={onClick}
    >
      <ObsidianIcon iconName={iconName} />
      <div className="filter-name">
        {filter.name}
      </div>
      <div className="file-count">
        {fileCount}
      </div>
    </div>
  )
}

const styles = {
  self: css`
    display: flex;
    flex-direction: horizontal;
    padding: 10px;
    border-radius: 4px;

    .filter-name {
      line-height: 24px;
      flex: 1;
    }
  `,
}
