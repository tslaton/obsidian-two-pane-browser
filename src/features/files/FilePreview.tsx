// Libraries
import { moment } from 'obsidian'
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { SelectableFile, selectFile } from './filesSlice'
import { useAppDispatch } from '../../plugin/hooks'
import PluginContext from '../../plugin/PluginContext'
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
    dispatch(selectFile(file.path))
    plugin.openFile(file)
  }

  return (
    <StyledFilePreview {...props} onClick={openFile}>
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
