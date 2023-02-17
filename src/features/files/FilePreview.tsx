// Libraries
import { moment } from 'obsidian'
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { FileMeta } from './filesSlice'
import Tag from '../tags/Tag'

interface FilePreviewProps {
  file: FileMeta
}

export default function FilePreview(props: FilePreviewProps) {
  const { file } = props
  const { name, stat, preview, tags } = file

  return (
    <StyledFilePreview>
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

const StyledFilePreview = styled.div`
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
  }

  .last-modified {
    color: cyan;
  }
`
