// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
import classNames from 'classnames'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import EditableName from '../../common/EditableName'
import FolderContextMenu from './FolderContextMenu'
import { 
  InteractiveFolder, makeSelectChildFoldersByParentPath, 
  toggleFolderExpansion, toggleFolderSelection, selectFolder,
  stopAwaitingRenameFolder,
} from './foldersSlice'
import { makeSelectFileCountByFolder } from '../files/filesSlice'
import { deactivateAllFilters } from '../filters/filtersSlice'
import ObsidianIcon from '../../common/ObsidianIcon'

interface FolderProps {
  folder: InteractiveFolder
  level: number
}

export default function Folder(props: FolderProps) {
  const { folder, level } = props
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const iconName = folder.isExpanded ? 'folder-open' : 'folder-closed'
  const selectChildFoldersByParentPath = React.useMemo(makeSelectChildFoldersByParentPath, [])
  const childFolders = useAppSelector(state => selectChildFoldersByParentPath(state, folder.path))
  const selectFileCountByFolder = React.useMemo(makeSelectFileCountByFolder, [])
  const fileCount = useAppSelector(state => selectFileCountByFolder(state, folder))

  function toggleIsExpanded(event: React.MouseEvent) {
    event.stopPropagation()
    dispatch(toggleFolderExpansion(folder.path))
  }

  function toggleIsSelected(event: React.MouseEvent) {
    if (event.metaKey) {
      dispatch(toggleFolderSelection(folder.path))
    }
    else {
      dispatch(selectFolder(folder.path))
    }
    dispatch(deactivateAllFilters())
  }

  function onContextMenu(event: React.MouseEvent) {
    const menu = FolderContextMenu(folder, plugin)
    menu.showAtMouseEvent(event.nativeEvent)
  }

  const styles = css`
    margin-left: ${level*20}px;

    & > .flex-folder-wrapper {
      display: flex;
      flex-direction: horizontal;
      padding: 10px;
      border-radius: 4px;
      pointer-events: ${folder.isAwaitingRename ? 'none' : 'initial' };
    }

    .folder-name {
      line-height: 24px;
      flex: 1;
    }
  `

  return (
    <div css={styles}>
      <div 
        className={classNames('nav-item', 'flex-folder-wrapper', { 'is-active' : folder.isSelected })}
        onClick={toggleIsSelected} 
        onContextMenu={onContextMenu}
      >
        <ObsidianIcon iconName={iconName} onClick={toggleIsExpanded} />
        <EditableName
          className="folder-name"
          name={folder.name}
          path={folder.path}
          isAwaitingRename={folder.isAwaitingRename}
          onBlurAction={stopAwaitingRenameFolder(folder.path)}
        />
        <div className="file-count">
          {fileCount}
        </div>
      </div>
      {folder.isExpanded && childFolders.map(childFolder =>
        <Folder key={childFolder.path} folder={childFolder} level={level + 1} />
      )}
    </div>
  )
}
