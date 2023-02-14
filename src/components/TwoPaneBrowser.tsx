// Libraries
import { 
  App,
  debounce,
  TFolder,
} from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'
import { 
  FolderIcon, 
  FolderOpenIcon, 
} from 'lucide-react'
// Modules
import { getTags, recurseChildren } from '../utils'
import { 
  initGlobalState,
  reducer,
  selectTopLevelFolders,
  selectIsOpenByPath,
  selectIsSelectedByPath,
  selectFilesInScope, 
} from '../state'

interface FolderProps {
  folder: TFolder
  level: number
}

function Folder(props: FolderProps) {
  const { folder, level } = props
  const [state, dispatch] = React.useReducer(reducer, initGlobalState())
  const isOpenByPath = selectIsOpenByPath(state)
  const isSelectedByPath = selectIsSelectedByPath(state)
  const isOpen = isOpenByPath[folder.path]
  const isSelected = isSelectedByPath[folder.path]
  const childFolders = folder.children.filter(f => f instanceof TFolder) as TFolder[]

  function toggleIsOpen(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    dispatch({ type: 'TOGGLE_IS_OPEN_BY_PATH', payload: folder.path })
  }

  function toggleIsSelected(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    dispatch({ type: 'TOGGLE_IS_SELECTED_BY_PATH', payload: folder.path })
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
      `} onClick={(e) => toggleIsSelected(e)}>
        <div className='clickable-icon' onClick={(e) => toggleIsOpen(e)}>
          <Icon size={18} />
        </div>
        <div css={css`
          line-height: 24px;
        `}>
          {folder.name}
        </div>
      </div>
      {isOpen && childFolders.map(f => 
        <Folder key={f.path} folder={f} level={level + 1} />
      )}
    </div>
  )
}

function FilePreview() {

}

export default function TwoPaneBrowser({ app } : { app: App }) {
  const [state, dispatch] = React.useReducer(reducer, initGlobalState())
  const topLevelFolders = selectTopLevelFolders(state)
  const filesInScope = selectFilesInScope(state)
  console.log('filesInScope: ', filesInScope)

  function syncVault() {
    console.log('called syncVault')
    // TODO: fix bug - root does not change, does not pick up (top level) changes
    dispatch({ type: 'LOAD_FILETREE', payload: app.vault.getRoot() })
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
        {/* right pane */}
      </div>
    </div>
  )
}
