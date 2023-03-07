// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { useAppDispatch } from '../../plugin/hooks'
import { TagCategoryFilter, toggleTagCategoryFilter } from './tagFiltersSlice'
import { alphaColor } from '../../utils'

// TODO: Generalize the magic numbers in this component
export default function TagCategory(props: TagCategoryFilter) {
  let { name, color, size } = props
  size = size ? size : 10

  const dispatch = useAppDispatch() 
  function onClick() {
    dispatch(toggleTagCategoryFilter(name))
  }

  return (
    <StyledTagCategory onClick={onClick} {...props}>
      <svg width={size*2} height={size*2} viewBox={`0 0 ${size*2} ${size*2}`}>
        <circle cx={size} cy={size} r={size-1.5} fill={color} />
      </svg>
    </StyledTagCategory>
  )
}

const StyledTagCategory = styled.div<TagCategoryFilter>`
  height: 20px;

  circle {
    stroke-width: ${props => props.isActive ? '3px' : '0px'};
    stroke: ${props => props.color};
    fill: ${props => props.isActive ? alphaColor(props.color) : props.color}
  }
`
