// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { FolderIcon, FolderOpenIcon } from 'lucide-react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
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

  function onKeyDown(event: React.KeyboardEvent) {
    console.log('onKeyDown')
    if (event.key === 'Enter') {
      event.preventDefault()
      nameRef.current?.blur()
    }
  }

  function onInput() {
    console.log('onInput: ', folder.path)
    dispatch(stopAwaitingRenameFolder(folder.path))
  }

  function onBlur(event: React.FocusEvent) {
    clearSelection()
    dispatch(stopAwaitingRenameFolder(folder.path))
    const newName = event.target.textContent || ''
    if (newName && newName !== folder.name) {
      const parentPath = getParentPath(folder)
      const newPath = `${parentPath}/${newName}`
      plugin.renameFolder(folder.path, newPath)
    }
    console.log('onBlur: ', newName)
  }

  return (
    <StyledFolder {...props}>
      <div className="flex-folder-wrapper" onClick={toggleIsSelected} onContextMenu={onContextMenu}>
        <div className="clickable-icon" onClick={toggleIsExpanded}>
          <Icon size={18} />
        </div>
        <div 
          className="folder-name" 
          contentEditable={"plaintext-only" as any} 
          suppressContentEditableWarning={true}
          ref={nameRef}
          onKeyDown={onKeyDown}
          onInput={onInput}
          onBlur={onBlur}
        >
          {folder.name}
        </div>
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
  }

  .folder-name {
    line-height: 24px;
    pointer-events: none;
  }
`
