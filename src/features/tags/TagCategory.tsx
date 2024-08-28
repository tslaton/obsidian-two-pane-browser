// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import { useAppDispatch } from '../../plugin/hooks'
import { TagCategoryFilter, toggleTagCategoryFilter } from './tagFiltersSlice'
import { alphaColor } from '../../utils'

// TODO: Generalize the magic numbers in this component
export default function TagCategory(props: TagCategoryFilter) {
  let { name, color, size, isActive } = props
  size = size ? size : 10

  const dispatch = useAppDispatch() 
  function onClick() {
    dispatch(toggleTagCategoryFilter(name))
  }

  const styles = css`
    height: ${2*(size || 10)}px;

    circle {
      stroke-width: ${isActive ? '3px' : '0px'};
      stroke: ${color};
      fill: ${isActive ? alphaColor(color, 0.5) : color};

      &:hover {
        stroke-width: 3px;
        stroke: ${alphaColor(color, 0.6)};
        fill: ${alphaColor(color, 0.6)};
      }
    }
  `

  return (
    <div css={styles} onClick={onClick}>
      <svg width={size*2} height={size*2} viewBox={`0 0 ${size*2} ${size*2}`}>
        <circle cx={size} cy={size} r={size-1.5} fill={color} />
      </svg>
    </div>
  )
}
