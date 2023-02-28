// Libraries
import * as React from 'react'
import styled from '@emotion/styled'

interface PlainTextContentEditableProps {
  disableClicks?: boolean
  children?: React.ReactNode
  [key: string]: any
}

const PlainTextContentEditable = React.forwardRef<HTMLDivElement, PlainTextContentEditableProps>((props, ref) => {
  return (
    <StyledPlainTextContentEditable {...props}
      contentEditable={"plaintext-only" as any} 
      suppressContentEditableWarning={true}
      ref={ref}
    >
      {props.children}
    </StyledPlainTextContentEditable>
  )
})

const StyledPlainTextContentEditable = styled.div<PlainTextContentEditableProps>`
  pointer-events: ${props => props.disableClicks ? 'none' : 'initial'};
`

export default PlainTextContentEditable
