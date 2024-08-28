// Libraries
import * as React from 'react'
// Modules
import PluginContext from '../plugin/PluginContext'
import { useTimeout, useAppDispatch } from '../plugin/hooks'
import PlainTextContentEditable from './PlainTextContentEditable'
import { getParentPath, selectElementContent, clearSelection } from '../utils'

interface EditableNameProps {
  name: string
  path: string
  extension?: string
  isAwaitingRename: boolean
  onBlurAction: any
  [key: string]: any
}

export default function EditableName(props: EditableNameProps) {
  const { name, path, extension, isAwaitingRename, onBlurAction, ...rest } = props
  const plugin = React.useContext(PluginContext)
  const dispatch = useAppDispatch()
  const nameRef = React.useRef<HTMLDivElement>(null)
  const [pendingRename, setPendingRename] = React.useState('')

  React.useEffect(() => {
    if (isAwaitingRename && nameRef.current) {
      selectElementContent(nameRef.current)
    }
  }, [isAwaitingRename])

  // Only enable clicks when folder.isAwaitingRename
  // During this time, stop propgation to avoid selecting 
  function onClick(event: React.MouseEvent) {
    event.stopPropagation()
  }

  // Note: fires *after* blur when escape is pressed
  function onKeyDown(event: React.KeyboardEvent) {
    switch(event.key) {
      // Do a rename
      case 'Enter': {
        event.preventDefault()
        nameRef.current?.blur()
        break
      }
      // Cancel the rename
      case 'Escape': {
        // A blur on ESC has already fired but we can still cancel the rename
        setPendingRename('')
        const nameContainerEl =  nameRef.current!
        nameContainerEl.textContent = name
        break
      }
    }
  }

  function onBlur(event: React.FocusEvent) {
    clearSelection()
    dispatch(onBlurAction)
    const newName = event.target.textContent || ''
    if (!newName) {
      event.target.textContent = name
    }
    else if (newName !== name) {
      setPendingRename(newName)
    }
  }

  // Renaming on a timeout gives onKeyDown === ESC opportunity to abort
  useTimeout(() => {
    const parentPath = getParentPath({ name, path })
    const newPath = extension
      ? `${parentPath}/${pendingRename}${extension}`
      : `${parentPath}/${pendingRename}`
    plugin.renameFileOrFolder(path, newPath)
  }, pendingRename ? 50 : null)

  return (
    <PlainTextContentEditable
      ref={nameRef}
      disableClicks={!isAwaitingRename}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      {...rest}
    >
      {name}
    </PlainTextContentEditable>
  )
}
