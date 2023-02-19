// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { useAppSelector } from './hooks'
import PluginContext from './PluginContext'
import Folder from '../features/folders/Folder'
import { selectTopLevelFolders, selectPathsInScope } from '../features/folders/foldersSlice'
import FilePreview from '../features/files/FilePreview'
import { selectFilesInScope } from '../features/files/filesSlice'
import Filter from '../features/filters/Filter'
import { selectFilters } from '../features/filters/filtersSlice'

export default function TwoPaneBrowser() {
  const topLevelFolders = useAppSelector(selectTopLevelFolders)
  const pathsInScope = useAppSelector(selectPathsInScope)
  const filesInScope = useAppSelector(selectFilesInScope)
  const filters = useAppSelector(selectFilters)
  const plugin = React.useContext(PluginContext)

  React.useEffect(() => {
    plugin.fetchFolders()
  }, [])

  React.useEffect(() => {
    plugin.fetchFiles(pathsInScope)
  }, [pathsInScope])

  return (
    <StyledTwoPaneBrowser>
      <div className="left-pane">
        <h2>Filters</h2>
        {filters.map(filter =>
          <Filter key={filter.id} filter={filter} />
        )}
        <h2>Folders</h2>
        {topLevelFolders.map(folder =>
          <Folder key={folder.path} folder={folder} level={0} />
        )}
      </div>
      <div className="right-pane">
        <h2>Files</h2>
        {filesInScope.map(file =>
          <FilePreview key={file.path} file={file} />
        )}
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
    padding: 0 20px 0 20px;
  }

  .right-pane {
    flex: 1;
    background-color: #222;
    padding: 0 20px 0 20px;
  }
`
