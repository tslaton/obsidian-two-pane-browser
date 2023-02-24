// Libraries
import { moment } from 'obsidian'
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch } from '../../plugin/hooks'
import FileContextMenu from './FileContextMenu'
import { SelectableFile } from './filesSlice'
import Tag from '../tags/Tag'

interface FilePreviewProps {
  file: SelectableFile
}

export default function FilePreview(props: FilePreviewProps) {
  const { file } = props
  const { name, stat, preview, tags } = file
  const dispatch = useAppDispatch()
  const plugin = React.useContext(PluginContext)

  function openFile() {
    // plugin will dispatch selectFile(file.path) after it is opened
    plugin.openFile(file)
  }

  function onContextMenu(event: React.MouseEvent) {
    const menu = FileContextMenu(file, plugin)
    menu.showAtMouseEvent(event.nativeEvent)
  }

  return (
    <StyledFilePreview {...props} onClick={openFile} onContextMenu={onContextMenu}>
      <div className="file-name">
        {name.replace(/\.[^/.]+$/, '')}
      </div>
      <div>
        {preview}
      </div>
      <div className="flex-file-info-wrapper">
        <div className="last-modified">
          {moment(stat.mtime).fromNow()}
        </div>
        {tags.map(tag => 
          <Tag key={tag} tag={tag} />
        )}
      </div>
    </StyledFilePreview>
  )
}

const StyledFilePreview = styled.div<FilePreviewProps>`
  padding: 10px;
  border-radius: 4px;
  background-color: ${props => props.file.isSelected ? 'var(--background-modifier-hover)' : 'inherit'};
  &:hover {
    background-color: var(--background-modifier-hover);
  }

  .file-name {
    font-size: 16px;
    font-weight: bold;
  }

  .flex-file-info-wrapper {
    display: flex;
    flex-direction: horizontal;
    flex-wrap: wrap;

    .tag {
      margin: 2px;
    }
  }

  .last-modified {
    color: var(--text-muted);
    margin-right: 4px;
  }
`
