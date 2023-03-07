// Libraries
import { moment } from 'obsidian'
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch } from '../../plugin/hooks'
import EditableName from '../../common/EditableName'
import FileContextMenu from './FileContextMenu'
import { InteractiveFile, toggleFileSelection, stopAwaitingRenameFile } from './filesSlice'
import Tag from '../tags/Tag'

interface FilePreviewProps {
  file: InteractiveFile
}

export default function FilePreview(props: FilePreviewProps) {
  const { file } = props
  const { name, path, stat, preview, tags, isAwaitingRename } = file
  const basename = name.replace(/\.[^/.]+$/, '')
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()

  function onClick(event: React.MouseEvent) {
    if (event.metaKey) {
      dispatch(toggleFileSelection(file.path))
    }
    else {
      // plugin will dispatch activateFile(file.path) after it is opened
      plugin.openFile(file)
    }
  }

  function onContextMenu(event: React.MouseEvent) {
    const menu = FileContextMenu(file, plugin)
    menu.showAtMouseEvent(event.nativeEvent)
  }

  const statusClasses = [
    file.isSelected ? ' is-selected' : '', 
    file.isActive ? 'is-active' : ''
  ].join(' ')

  return (
    <StyledFilePreview 
      className={`nav-item ${statusClasses}`} 
      onClick={onClick} 
      onContextMenu={onContextMenu} 
      {...props}
    >
      <EditableName 
        className="file-name"
        name={basename}
        path={path}
        extension={'.md'}
        isAwaitingRename={isAwaitingRename}
        onBlurAction={stopAwaitingRenameFile(path)}
      />
      <div>
        {preview}
      </div>
      <div className="flex-file-info-wrapper">
        <div className="last-modified">
          {moment(stat.mtime).fromNow()}
        </div>
        {tags.map(tag => 
          <Tag key={tag} name={tag} />
        )}
      </div>
    </StyledFilePreview>
  )
}

const StyledFilePreview = styled.div<FilePreviewProps>`
  padding: 10px;
  border-radius: 4px;

  .file-name {
    font-size: 16px;
    font-weight: bold;
  }

  .flex-file-info-wrapper {
    display: flex;
    flex-direction: horizontal;
    flex-wrap: wrap;
    align-items: center;

    .tag {
      margin: 2px 0.5px;
    }
  }

  .last-modified {
    color: var(--text-faint);
    margin-right: 4px;
  }
`
