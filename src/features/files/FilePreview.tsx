// Libraries
import { moment } from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'
import classNames from 'classnames'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppDispatch } from '../../plugin/hooks'
import EditableName from '../../common/EditableName'
import FileContextMenu from './FileContextMenu'
import SearchResults from './SearchResults'
import { InteractiveFile, toggleFileSelection, stopAwaitingRenameFile } from './filesSlice'
import Tag from '../tags/Tag'
import ObsidianMarkdown from '../../common/ObsidianMarkdown'

interface FilePreviewProps {
  file: InteractiveFile
}

export default function FilePreview(props: FilePreviewProps) {
  const { file } = props
  const { name, path, stat, preview, tags, isAwaitingRename, searchResults } = file
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

  return (
    <div 
      className={classNames('nav-item', { 'is-selected': file.isSelected, 'is-active': file.isActive })}
      css={styles.self}
      onClick={onClick} 
      onContextMenu={onContextMenu}
    >
      <EditableName 
        css={styles.filename}
        name={basename}
        path={path}
        extension=".md"
        isAwaitingRename={isAwaitingRename}
        onBlurAction={stopAwaitingRenameFile(path)}
      />
      <ObsidianMarkdown content={preview} path={file.path} />      
      <div css={styles.fileInfoFlexContainer}>
        <div css={styles.lastModified}>
          {moment(stat.mtime).fromNow()}
        </div>
        {tags.map(tag => 
          <Tag key={tag} name={tag} />
        )}
      </div>
      {searchResults && <SearchResults {...searchResults} />}
    </div>
  )
}

const styles = {
  self: css`
    padding: 10px;
    border-radius: 4px;
  `,
  filename: css`
    font-size: 16px;
    font-weight: bold;
  `,
  fileInfoFlexContainer: css`
    display: flex;
    flex-direction: horizontal;
    flex-wrap: wrap;
    align-items: center;
    
    .tag {
      margin: 2px 0.5px;
    }
  `,
  lastModified: css`
    color: var(--text-faint);
    margin-right: 4px;
  `,
}
