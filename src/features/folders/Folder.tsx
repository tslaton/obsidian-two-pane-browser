// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { FolderIcon, FolderOpenIcon } from 'lucide-react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import EditableName from '../../common/EditableName'
import FolderContextMenu from './FolderContextMenu'
import { 
  FolderMeta, makeSelectChildFoldersByParentPath, 
  toggleFolderExpansion, toggleFolderSelection, selectFolder,
  stopAwaitingRenameFolder,
} from './foldersSlice'
import { deselectAllFilters } from '../filters/filtersSlice'

interface FolderProps {
  folder: FolderMeta
  level: number
}

export default function Folder(props: FolderProps) {
  const { folder, level } = props
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const Icon = folder.isExpanded ? FolderOpenIcon : FolderIcon
  const selectChildFoldersByParentPath = React.useMemo(makeSelectChildFoldersByParentPath, [])
  const childFolders = useAppSelector(state => selectChildFoldersByParentPath(state, folder.path))

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
    dispatch(deselectAllFilters())
  }

  function onContextMenu(event: React.MouseEvent) {
    const menu = FolderContextMenu(folder, plugin)
    menu.showAtMouseEvent(event.nativeEvent)
  }

  return (
    <StyledFolder {...props}>
      <div className="flex-folder-wrapper" onClick={toggleIsSelected} onContextMenu={onContextMenu}>
        <div className="clickable-icon" onClick={toggleIsExpanded}>
          <Icon size={18} />
        </div>
        <EditableName
          className="folder-name"
          name={folder.name}
          path={folder.path}
          isAwaitingRename={folder.isAwaitingRename}
          onBlurAction={stopAwaitingRenameFolder(folder.path)}
        />
      </div>
      {folder.isExpanded && childFolders.map(childFolder =>
        <Folder key={childFolder.path} folder={childFolder} level={level + 1} />
      )}
    </StyledFolder>
  )
}

const StyledFolder = styled.div<FolderProps>`
  margin-left: ${props => `${props.level*20}px`};

  & > .flex-folder-wrapper {
    display: flex;
    flex-direction: horizontal;
    padding: 10px;
    border-radius: 4px;
    background-color: ${props => props.folder.isSelected ? 'var(--background-modifier-hover)' : 'inherit' };
    &:hover {
      background-color: var(--background-modifier-hover);
    }
    pointer-events: ${props => props.folder.isAwaitingRename ? 'none' : 'initial' };
  }

  .folder-name {
    line-height: 24px;
    flex: 1;
  }
`
