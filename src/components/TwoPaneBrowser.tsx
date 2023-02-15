// Libraries
import { App, debounce, TFile } from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'
import { FolderIcon, FolderOpenIcon } from 'lucide-react'
// Modules
import { useAppDispatch, useAppSelector } from 'src/hooks'
import { selectTopLevelFolders, selectFilesInScope } from 'src/store'
import { FileMeta, FolderMeta, folderMetaFromTFolder, loadFileTree } from 'src/slices/folderTreeSlice'
import { selectIsOpenByPath, toggleIsOpenByPath } from 'src/slices/isOpenByPathSlice'
import { selectIsSelectedByPath, toggleIsSelectedByPath } from 'src/slices/isSelectedByPathSlice'
import { selectFilePreviewsByPath, loadFilePreviewsByPath, createFilePreviewFromContents } from 'src/slices/filePreviewsSlice'

interface FolderProps {
  folder: FolderMeta
  level: number
}

function Folder(props: FolderProps) {
  const { folder, level } = props
  const dispatch = useAppDispatch()
  const isOpenByPath = useAppSelector(selectIsOpenByPath)
  const isOpen = isOpenByPath[folder.path]
  const isSelectedByPath = useAppSelector(selectIsSelectedByPath)
  const isSelected = isSelectedByPath[folder.path]

  function toggleIsOpen() {
    dispatch(toggleIsOpenByPath(folder.path))
  }

  function toggleIsSelected() {
    dispatch(toggleIsSelectedByPath(folder.path))
  }

  let Icon = isOpen ? FolderOpenIcon : FolderIcon

  return (
    <div css={css`
      margin-left: ${level*20}px;
    `}>
      <div css={css`
        display: flex;
        flex-direction: horizontal;
        padding: 10px;
        border-radius: 4px;
        background-color: ${isSelected ? '#333' : 'inherit' };
      `} onClick={() => toggleIsSelected()}>
        <div className='clickable-icon' onClick={() => toggleIsOpen()}>
          <Icon size={18} />
        </div>
        <div css={css`
          line-height: 24px;
        `}>
          {folder.name}
        </div>
      </div>
      {isOpen && folder.children.map(f => 
        <Folder key={f.path} folder={f} level={level + 1} />
      )}
    </div>
  )
}

function FilePreview({ file } : { file: FileMeta } ) {
  const filePreviewsByPath = useAppSelector(selectFilePreviewsByPath)
  const preview = filePreviewsByPath[file.path]
  return (
    <div css={css`
      height: 200px;
      border-radius: 4px;
    `}>
      {preview}
    </div>
  )
}

export default function TwoPaneBrowser({ app } : { app: App }) {
  const dispatch = useAppDispatch()
  const topLevelFolders = useAppSelector(selectTopLevelFolders)
  const filesInScope = useAppSelector(selectFilesInScope)

  function syncVault() {
    dispatch(loadFileTree(folderMetaFromTFolder(app.vault.getRoot())))
  }
  const debouncedVaultSync = debounce(syncVault, 1000, true) 

  React.useEffect(() => {
    syncVault()

    // Register handlers for vault updates
    app.vault.on('create', debouncedVaultSync)
    app.vault.on('delete', debouncedVaultSync)
    app.vault.on('rename', debouncedVaultSync)
    // app.vault.on('modify', debouncedVaultSync)

    return () => {
      // Unregister vault update handlers
      app.vault.off('create', debouncedVaultSync)
      app.vault.off('delete', debouncedVaultSync)
      app.vault.off('rename', debouncedVaultSync)
      // app.vault.off('modify', debouncedVaultSync)
    }
  }, [])

  React.useEffect(() => {
    const fetchFilePreviews = async() => {
      const filePreviewsByPath = {} as Record<string, string>
      for (let file of filesInScope) {
        const readableFile = app.vault.getAbstractFileByPath(file.path)
        const contents = await app.vault.cachedRead(readableFile as TFile)
        filePreviewsByPath[file.path] = createFilePreviewFromContents(contents)
      }
      dispatch(loadFilePreviewsByPath(filePreviewsByPath))
    }
    fetchFilePreviews()
  }, [filesInScope])

  return (
    <div css={css`
      display: flex;
      flex-direction: horizontal;
      height: 100%;
    `}>
      <div css={css`
        width: 280px;
      `}>
        <h2>Folders</h2>
        {topLevelFolders.map(f =>
          <Folder key={f.path} folder={f} level={0} />
        )}
      </div>
      <div css={css`
        flex: 1;
        background-color: #222;
      `}>
        <h2>Files</h2>
        {filesInScope.map(f =>
          <FilePreview key={f.path} file={f} />
        )}
      </div>
    </div>
  )
}
