// Libraries
import * as React from 'react'
import styled from '@emotion/styled'

interface ColorCategoryProps {
  size: number
  color: string
}

export default function TagCategory({ size, color }: ColorCategoryProps) {
  return (
    <StyledTagCategory>
      <svg width={size*2} height={size*2} viewBox={`0 0 ${size*2} ${size*2}`}>
        <circle cx={size} cy={size} r={size} fill={color} />
      </svg>
    </StyledTagCategory>

  )
}

const StyledTagCategory = styled.div`
  
`
