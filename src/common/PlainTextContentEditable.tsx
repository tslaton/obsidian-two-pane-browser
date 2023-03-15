// Libraries
import * as React from 'react'
import { css } from '@emotion/react'

interface PlainTextContentEditableProps {
  disableClicks?: boolean
  children?: React.ReactNode
  [key: string]: any
}

const PlainTextContentEditable = React.forwardRef<HTMLDivElement, PlainTextContentEditableProps>((props, ref) => {
  const { disableClicks, ...rest } = props
  
  const styles = css`
    pointer-events: ${disableClicks ? 'none' : 'initial'};
  `
  
  return (
    <div css={styles} {...rest}
      contentEditable={'plaintext-only' as any} 
      suppressContentEditableWarning={true}
      ref={ref}
    >
      {props.children}
    </div>
  )
})

export default PlainTextContentEditable
