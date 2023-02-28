// Libraries
import * as React from 'react'
import { css, Global } from '@emotion/react'
import styled from '@emotion/styled'
import { FolderPlus } from 'lucide-react'
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

  function addNewTopLevelFolder() {
    plugin.createFolder()
  }

  return (
    <StyledTwoPaneBrowser>
      <Global styles={css`    
        :root {
          --two-pane-browser-gutter: 12px;
        }
        ${tagsCSS}
      `}
      />
      <div className="left-pane">
        <div className="section-title">
          Filters
        </div>
        <div>
          {filters.map(filter =>
            <Filter key={filter.id} {...filter} />
          )}
        </div>
        <div className="flex-section-title-wrapper">
          <div className="section-title">
            Folders
          </div>
          <div className="clickable-icon" onClick={addNewTopLevelFolder}>
            <FolderPlus size={18} />
          </div>
        </div>
        <div className="scroller">
          {topLevelFolders.map(folder =>
            <Folder key={folder.path} folder={folder} level={0} />
          )}
        </div>
      </div>
      <div className="right-pane">
        <Search />
        <div className="section-title">
          Files
        </div>
        <div className="scroller">
          {filesInScope.map(file =>
            <FilePreview key={file.path} file={file} />
          )}
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
    padding: 0 var(--two-pane-browser-gutter);
    display: flex;
    flex-direction: column;
  }

  .right-pane {
    flex: 1;
    background-color: var(--background-primary);
    padding: 0 var(--two-pane-browser-gutter);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .section-title {
    font-variant: var(--h2-variant);
    letter-spacing: -0.015em;
    line-height: var(--h2-line-height);
    font-size: var(--h2-size);
    color: var(--h2-color);
    font-weight: var(--h2-weight);
    font-style: var(--h2-style);
    font-family: var(--h2-font);
    margin: var(--two-pane-browser-gutter) 0;
  }

  .flex-section-title-wrapper {
    display: flex;
    flex-direction: horizontal;
    justify-content: space-between;
    align-items: center;

    .clickable-icon {
      height: fit-content;
      visibility: hidden;
    }

    &:hover {
      .clickable-icon {
        visibility: visible;
      }
    }
  }

  .scroller {
    flex: 1;
    overflow: auto;
    margin-bottom: var(--two-pane-browser-gutter);
  }
`
