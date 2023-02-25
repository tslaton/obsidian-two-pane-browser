// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { FolderIcon, FolderOpenIcon } from 'lucide-react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector, useTimeout } from '../../plugin/hooks'
import PlainTextContentEditable from '../../common/PlainTextContentEditable'
import FolderContextMenu from './FolderContextMenu'
import { 
  FolderMeta, makeSelectChildFoldersByParentPath, 
  toggleFolderExpansion, toggleFolderSelection, selectFolder,
  stopAwaitingRenameFolder,
} from './foldersSlice'
import { deselectAllFilters } from '../filters/filtersSlice'
import { getParentPath, selectElementContent, clearSelection } from '../../utils'

interface FolderProps {
  folder: FolderMeta
  level: number
}

export default function Folder(props: FolderProps) {
  const { folder, level } = props
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const nameRef = React.useRef<HTMLDivElement>(null)
  const [pendingRename, setPendingRename] = React.useState('')
  const Icon = folder.isExpanded ? FolderOpenIcon : FolderIcon
  const selectChildFoldersByParentPath = React.useMemo(makeSelectChildFoldersByParentPath, [])
  const childFolders = useAppSelector(state => selectChildFoldersByParentPath(state, folder.path))

  React.useEffect(() => {
    if (folder.isAwaitingRename && nameRef.current) {
      selectElementContent(nameRef.current)
    }
  }, [folder])

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

  // Only enable clicks when folder.isAwaitingRename
  // During this time, stop propgation to flex-folder-wrapper to avoid selecting 
  function onClick(event: React.MouseEvent) {
    event.stopPropagation()
  }

  // Note: fires *after* blur when escape is pressed
  function onKeyDown(event: React.KeyboardEvent) {
    switch(event.key) {
      // Do a rename
      case 'Enter': {
        event.preventDefault()
        nameRef.current?.blur()
        break
      }
      // Cancel the rename
      case 'Escape': {
        // A blur on ESC has already fired but we can still cancel the rename
        setPendingRename('')
        const nameContainerEl =  nameRef.current!
        nameContainerEl.textContent = folder.name
        break
      }
    }
  }

  function onBlur(event: React.FocusEvent) {
    clearSelection()
    dispatch(stopAwaitingRenameFolder(folder.path))
    const newName = event.target.textContent || ''
    if (!newName) {
      event.target.textContent = folder.name
    }
    else if (newName !== folder.name) {
      setPendingRename(newName)
    }
  }

  // Renaming on a timeout gives onKeyDown === ESC opportunity to abort
  useTimeout(() => {
    const parentPath = getParentPath(folder)
    const newPath = `${parentPath}/${pendingRename}`
    plugin.renameFolder(folder.path, newPath)
  }, pendingRename ? 50 : null)

  return (
    <StyledFolder {...props}>
      <div className="flex-folder-wrapper" onClick={toggleIsSelected} onContextMenu={onContextMenu}>
        <div className="clickable-icon" onClick={toggleIsExpanded}>
          <Icon size={18} />
        </div>
        <PlainTextContentEditable
          className="folder-name"
          ref={nameRef}
          disableClicks={!folder.isAwaitingRename}
          onClick={onClick}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        >
          {folder.name}
        </PlainTextContentEditable>
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
