// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { useAppSelector, useAppDispatch } from '../../plugin/hooks'
import { selectTagCategories} from '../settings/settingsSlice'
import { TagCategoryFilter, toggleTagCategoryFilter } from '../tags/tagCategoryFiltersSlice'

interface ColorCategoryProps {
  size: number
  filterState: TagCategoryFilter
}

export default function TagCategory({ size, filterState }: ColorCategoryProps) {
  const tagCategories = useAppSelector(selectTagCategories)
  const color = tagCategories[filterState.name].style.color
  const dispatch = useAppDispatch() 

  function onClick() {
    dispatch(toggleTagCategoryFilter(filterState.name))
  }

  return (
    <StyledTagCategory onClick={onClick} {...filterState}>
      <svg width={size*2} height={size*2} viewBox={`0 0 ${size*2} ${size*2}`}>
        <circle cx={size} cy={size} r={size} fill={color} />
      </svg>
    </StyledTagCategory>
  )
}

const StyledTagCategory = styled.div<TagCategoryFilter>`
  circle {
    stroke-width: ${props => props.isActive ? '2px' : '0px'};
    stroke: ${props => props.isActive ? 'white' : 'initial'};
  }
`
