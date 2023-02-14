// Libraries
import { 
  App,
  debounce,
  TFolder,
} from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import { getTags, recurseChildren } from '../utils'
import { 
  initGlobalState,
  selectTopLevelFolders,
  reducer, 
} from '../state'

interface FolderProps {
  folder: TFolder
  isOpen: boolean
  isSelected: boolean
  level: number
}

function Folder(props: FolderProps) {
  const { folder, isOpen, isSelected, level } = props
  const childFolders = folder.children.filter(f => f instanceof TFolder) as TFolder[]
  return (
    <div css={css`
      margin-left: ${level*20}px;
    `}>
      <div css={css`
        color: ${isOpen ? 'lightgreen' : 'cyan'};
        padding: 10px;
        border-radius: 4px;
        background-color: ${isSelected ? '#666' : '#333'};
      `}>
        {folder.name}
      </div>
      {isOpen && childFolders.map(f => 
        <Folder key={f.path} folder={f} isOpen={false} isSelected={false} level={level + 1} />
      )}
    </div>
  )
}

export default function TwoPaneBrowser({ app } : { app: App }) {
  const [state, dispatch] = React.useReducer(reducer, initGlobalState())
  const topLevelFolders = selectTopLevelFolders(state)

  function syncVault() {
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
          <Folder key={f.path} folder={f} isOpen={true} isSelected={true} level={0} />
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
