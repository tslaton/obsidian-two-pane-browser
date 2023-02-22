// Libraries
import * as React from 'react'
import { css, Global } from '@emotion/react'
import styled from '@emotion/styled'
// Modules
import { useAppSelector } from './hooks'
import PluginContext from './PluginContext'
import Folder from '../features/folders/Folder'
import { selectTopLevelFolders } from '../features/folders/foldersSlice'
import FilePreview from '../features/files/FilePreview'
import Filter from '../features/filters/Filter'
import { selectFilters } from '../features/filters/filtersSlice'
import Search from '../features/search/Search'
import { selectSortedFilesInScope } from '../features/search/searchSlice'
import { selectStylesByTag } from '../features/settings/settingsSlice'
import { rgbFromHex } from '../utils'

export default function TwoPaneBrowser() {
  const plugin = React.useContext(PluginContext)
  const topLevelFolders = useAppSelector(selectTopLevelFolders)
  const filesInScope = useAppSelector(selectSortedFilesInScope)
  const filters = useAppSelector(selectFilters)
  const stylesByTag = useAppSelector(selectStylesByTag)
  let tagsCSS = ''
  for (let [tag, style] of Object.entries(stylesByTag)) {
    tag = tag.substring(1)
    const { r, g, b } = rgbFromHex(style.color)
    tagsCSS += `.cm-tag-${tag} { color: ${style.color}; background-color: rgba(${r},${g},${b},0.1); }`
  }

  // FUTURE: Consider fetching files more efficiently (ie, before filters only fetched files for paths in scope)
  React.useEffect(() => {
    plugin.fetchFolders()
    plugin.fetchFiles()
  }, [])

  return (
    <StyledTwoPaneBrowser>
      <Global styles={css`    
        ${tagsCSS}
      `}
      />
      <div className="left-pane">
        <h2>Filters</h2>
        <div className="scoller">
          {filters.map(filter =>
            <Filter key={filter.id} {...filter} />
          )}
          <div className="spacer" />
        </div>
        <h2>Folders</h2>
        <div className="scroller">
          {topLevelFolders.map(folder =>
            <Folder key={folder.path} folder={folder} level={0} />
          )}
          <div className="spacer" />
        </div>
      </div>
      <div className="right-pane">
        <Search />
        <h2>Files</h2>
        <div className="scroller">
          {filesInScope.map(file =>
            <FilePreview key={file.path} file={file} />
          )}
          <div className="spacer" />
        </div>
      </div>
    </StyledTwoPaneBrowser>
  )
}

const StyledTwoPaneBrowser = styled.div`
  display: flex;
  flex-direction: horizontal;
  height: 100%;

  .left-pane {
    width: 280px;
    background-color: var(--background-secondary);
    padding: 0 12px;
    display: flex;
    flex-direction: column;
  }

  .right-pane {
    flex: 1;
    background-color: var(--background-primary);
    padding: 0 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .scroller {
    flex: 1;
    overflow: auto;
  }

  .spacer {
    height: 12px;
  }
`
