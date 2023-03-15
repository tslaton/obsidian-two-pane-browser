// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import { useAppSelector } from './hooks'
import PluginContext from './PluginContext'
import GlobalStyles from './GlobalStyles'
import Folder from '../features/folders/Folder'
import { selectTopLevelFolders } from '../features/folders/foldersSlice'
import FilePreview from '../features/files/FilePreview'
import Filter from '../features/filters/Filter'
import { selectFilters } from '../features/filters/filtersSlice'
import SearchControls from '../features/search/SearchControls'
import Search from '../features/search/Search'
import { selectSearchOptions } from '../features/search/searchSlice'
import { selectSearchInputHasFocus } from '../features/search/searchSlice'
import { selectTagFilteredFilesInScope } from '../features/tags/tagFiltersSlice'
import ObsidianIcon from '../common/ObsidianIcon'

export default function TwoPaneBrowser() {
  const plugin = React.useContext(PluginContext)
  const topLevelFolders = useAppSelector(selectTopLevelFolders)
  const filesInScope = useAppSelector(selectTagFilteredFilesInScope)
  const filters = useAppSelector(selectFilters)
  const showSearch = useAppSelector(selectSearchOptions).showSearch.isActive

  // FUTURE: Consider fetching files more efficiently (ie, before filters only fetched files for paths in scope)
  React.useEffect(() => {
    plugin.fetchFolders()
    plugin.fetchFiles()
  }, [])

  // Make the first file active when no file in-scope is active
  // TODO: Decide if this behavior is actually desired
  // It is slighty annoying if you just want to browse files vs. the open one
  // However, you could always open your "compare" file in a tab or pane first
  const searchInputHasFocus = useAppSelector(selectSearchInputHasFocus)
  React.useEffect(() => {
    if (!searchInputHasFocus) {
      const activeFile = filesInScope.find(file => file.isActive)
      if (!activeFile && filesInScope.length > 0) {
        plugin.openFile(filesInScope[0])
      }
    }
  }, [filesInScope])

  function addNewTopLevelFolder() {
    plugin.createFolder()
  }

  return (
    <div css={styles.self}>
      <GlobalStyles />
      <div css={styles.leftPane}>
        <div css={styles.sectionTitleFlexContainer}>
          <div className="section-title">
            Filters
          </div>
        </div>
        <div>
          {filters.map(filter =>
            <Filter key={filter.id} {...filter} />
          )}
        </div>
        <div css={styles.sectionTitleFlexContainer}>
          <div className="section-title">
            Folders
          </div>
          <ObsidianIcon iconName="folder-plus" onClick={addNewTopLevelFolder} />
        </div>
        <div css={styles.scroller}>
          {topLevelFolders.map(folder =>
            <Folder key={folder.path} folder={folder} level={0} />
          )}
        </div>
      </div>
      <div css={styles.rightPane}>
        <SearchControls />
        {showSearch && <Search />}
        <div css={styles.sectionTitleFlexContainer}>
          <div className="section-title">
            Files
          </div>
          <div className="file-count">
            {filesInScope.length}
          </div>
        </div>
        <div css={styles.scroller}>
          {filesInScope.map(file =>
            <FilePreview key={file.path} file={file} />
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  self: css`
    display: flex;
    flex-direction: horizontal;
    height: 100%;  
  `,
  scroller: css`
    flex: 1;
    overflow: auto;
    margin-bottom: var(--two-pane-browser-gutter);
  `,
  leftPane: css`
    width: 280px;
    background-color: var(--background-secondary);
    padding: 0 var(--two-pane-browser-gutter);
    display: flex;
    flex-direction: column;
  `,
  rightPane: css`
    flex: 1;
    background-color: var(--background-primary);
    padding: 0 var(--two-pane-browser-gutter);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `,
  sectionTitleFlexContainer: css`
    display: flex;
    flex-direction: horizontal;
    justify-content: space-between;
    align-items: center;

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

    .clickable-icon {
      height: fit-content;
      visibility: hidden;
    }

    &:hover {
      .clickable-icon {
        visibility: visible;
      }
    }
  `,
}
