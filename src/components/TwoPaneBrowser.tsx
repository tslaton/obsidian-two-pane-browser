// Libraries
import { App, debounce, TFile, moment } from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'
import { FolderIcon, FolderOpenIcon } from 'lucide-react'
// Modules
import { TwoPaneBrowserSettings, tagColors } from '../settings'
import { getTags } from '../utils'
import { useAppDispatch, useAppSelector } from '../hooks'
import { selectTopLevelFolders, selectFilesInScope } from '../store'
import { FileMeta, FolderMeta, folderMetaFromTFolder, loadFolderTree } from '../slices/folderTreeSlice'
import { selectIsOpenByPath, toggleIsOpenByPath } from '../slices/isOpenByPathSlice'
import { selectIsSelectedByPath, toggleIsSelectedByPath } from '../slices/isSelectedByPathSlice'
import { selectFilePreviewsByPath, loadFilePreviewsByPath, createFilePreview } from '../slices/filePreviewsByPathSlice'
import { selectTagsByPath, loadTagsByPath } from '../slices/tagsByPathSlice'

function Folder(props: { folder: FolderMeta, level: number }) {
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

interface TagMeta {
  name: string
  color: string
}

function Tag({ tag, color, bgColor } : { tag: string, color: string, bgColor: string }) {
  return (
    <div css={css`
      color: ${color}; 
      background-color: ${bgColor};
      padding: 0px 8px 2px 8px;
      border-radius: 10px;
      margin-left: 4px;
    `}>
      {tag}
    </div>
  )
}

function FilePreview({ file, colorNameByTag } : { file: FileMeta, colorNameByTag: Record<string, string> } ) {
  const filePreviewsByPath = useAppSelector(selectFilePreviewsByPath)
  const tagsByPath = useAppSelector(selectTagsByPath)
  const tags = tagsByPath[file.path] || []
  const preview = filePreviewsByPath[file.path]
  return (
    <div css={css`
      padding: 10px;
      border-radius: 4px;
    `}>
      <div css={css`
        font-size: 16px;
        font-weight: bold;
      `}>
        {file.name.replace(/\.[^/.]+$/, '')}
      </div>
      <div>
        {preview}
      </div>
      <div css={css`
        display: flex;
        flex-direction: horizontal;
        flex-wrap: wrap;
      `}>
        <div css={css`
          color: cyan;
        `}>
          {moment(file.stats.mtime).fromNow()}
        </div>
        {tags.map(tag => 
          // @ts-ignore
          <Tag key={tag} tag={tag} color={tagColors[colorNameByTag[tag]].text} bgColor={tagColors[colorNameByTag[tag]].pill} />
        )}
      </div>
    </div>
  )
}

export default function TwoPaneBrowser({ app, settings } : { app: App, settings: TwoPaneBrowserSettings }) {
  const dispatch = useAppDispatch()
  const topLevelFolders = useAppSelector(selectTopLevelFolders)
  const filesInScope = useAppSelector(selectFilesInScope)
  // Compute tag colors
  const colorNameByTag: Record<string, string> = {}
  for (let [colorName, tagsString] of Object.entries(settings.tagsByColorName)) {
    const tags = tagsString.split(' ')
    for (let tag of tags) {
      colorNameByTag[tag] = colorName
    }
  }

  function syncVault() {
    dispatch(loadFolderTree(folderMetaFromTFolder(app.vault.getRoot())))
  }
  const debouncedVaultSync = debounce(syncVault, 1000, true) 

  React.useEffect(() => {
    syncVault()

    // Register handlers for vault updates
    app.vault.on('create', debouncedVaultSync)
    app.vault.on('delete', debouncedVaultSync)
    app.vault.on('rename', debouncedVaultSync)

    return () => {
      // Unregister vault update handlers
      app.vault.off('create', debouncedVaultSync)
      app.vault.off('delete', debouncedVaultSync)
      app.vault.off('rename', debouncedVaultSync)
    }
  }, [])

  React.useEffect(() => {
    // TODO: previews will depend on selected tags, search query, etc. too
    const fetchFileMetadata = async() => {
      const filePreviewsByPath: Record<string, string> = {}
      const tagsByPath: Record<string, string[]> = {} 
      for (let file of filesInScope) {
        const readableFile = app.vault.getAbstractFileByPath(file.path) as TFile
        tagsByPath[file.path] = getTags(readableFile, app.metadataCache)
        const contents = await app.vault.cachedRead(readableFile)
        filePreviewsByPath[file.path] = createFilePreview(contents)
      }
      dispatch(loadFilePreviewsByPath(filePreviewsByPath))
      dispatch(loadTagsByPath(tagsByPath))
    }
    fetchFileMetadata()
    const debouncedFetchFileMetadata = debounce(fetchFileMetadata, 1000, true) 
    // Watch for changes to the file(s)
    app.vault.on('modify', debouncedFetchFileMetadata)
    return () => {
      app.vault.off('modify', debouncedFetchFileMetadata)
    }
  }, [filesInScope])

  return (
    <div css={css`
      display: flex;
      flex-direction: horizontal;
      height: 100%;
    `}>
      <div css={css`
        width: 280px;
        padding: 0 20px 0 20px;
      `}>
        <h2>Folders</h2>
        {topLevelFolders.map(f =>
          <Folder key={f.path} folder={f} level={0} />
        )}
      </div>
      <div css={css`
        flex: 1;
        background-color: #222;
        padding: 0 20px 0 20px;
      `}>
        <h2>Files</h2>
        {filesInScope.map(f =>
          <FilePreview key={f.path} file={f} colorNameByTag={colorNameByTag} />
        )}
      </div>
    </div>
  )
}
