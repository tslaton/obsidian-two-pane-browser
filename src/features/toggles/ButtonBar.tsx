// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
import { SearchIcon, FilePlus2Icon } from 'lucide-react'
// Modules
import { useAppDispatch } from '../../plugin/hooks'
import { toggleToggle } from '../toggles/togglesSlice'

export default function ButtonBar() {
  const dispatch = useAppDispatch()
  
  function toggleShowSearch() {
    dispatch(toggleToggle('show-search'))
  }

  function createNewDocument() {
    console.log('createNewDocument called...')
  }

  return (
    <StyledButtonBar>
      <div className="clickable-icon" onClick={toggleShowSearch}>
        <SearchIcon size={18} />
      </div>
      <div className="clickable-icon" onClick={createNewDocument}>
        <FilePlus2Icon size={18} />
      </div>
    </StyledButtonBar>
  )
}

const StyledButtonBar = styled.div`
  display: flex;
  flex-direction: horizontal;
  justify-content: flex-end;
`
