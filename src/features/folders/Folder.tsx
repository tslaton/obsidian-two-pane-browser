// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { FolderIcon, FolderOpenIcon } from 'lucide-react'
// Modules
import { useAppDispatch, useAppSelector } from '../../plugin/hooks'
import { 
  FolderMeta, makeSelectChildFoldersByParentPath, 
  toggleFolderExpansion, toggleFolderSelection, selectFolder, 
} from './foldersSlice'
import { deselectAllFilters } from '../filters/filtersSlice'

interface FolderProps {
  folder: FolderMeta
  level: number
}

export default function Folder(props: FolderProps) {
  const { folder, level } = props
  const dispatch = useAppDispatch()
  const selectChildFoldersByParentPath = React.useMemo(makeSelectChildFoldersByParentPath, [])
  const childFolders = useAppSelector(state => selectChildFoldersByParentPath(state, folder.path))

  const Icon = folder.isExpanded ? FolderOpenIcon : FolderIcon

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

  return (
    <StyledFolder {...props}>
      <div className="flex-folder-wrapper" onClick={toggleIsSelected}>
        <div className="clickable-icon" onClick={toggleIsExpanded}>
          <Icon size={18} />
        </div>
        <div className="folder-name">
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

  .flex-folder-wrapper {
    display: flex;
    flex-direction: horizontal;
    padding: 10px;
    border-radius: 4px;
    background-color: ${props => props.folder.isSelected ? '#333' : 'inherit' };
  }

  .folder-name {
    line-height: 24px;
  }
`
