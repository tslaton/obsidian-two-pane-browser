// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { useAppDispatch } from '../../plugin/hooks'
import { TagCategoryFilter, toggleTagCategoryFilter } from './tagFiltersSlice'

interface TagCategoryProps extends TagCategoryFilter {
  size: number
}

export default function TagCategory(props: TagCategoryProps) {
  const { name, style, size } = props
  const dispatch = useAppDispatch() 

  function onClick() {
    dispatch(toggleTagCategoryFilter(name))
  }

  return (
    <StyledTagCategory onClick={onClick} {...props}>
      <svg width={size*2} height={size*2} viewBox={`0 0 ${size*2} ${size*2}`}>
        <circle cx={size} cy={size} r={size} fill={style.color} />
      </svg>
    </StyledTagCategory>
  )
}

const StyledTagCategory = styled.div<TagCategoryProps>`
  circle {
    stroke-width: ${props => props.isActive ? '2px' : '0px'};
    stroke: ${props => props.isActive ? 'white' : 'initial'};
  }
`
