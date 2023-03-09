// Libraries
import { getIcon } from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'
import classNames from 'classnames'

interface ObsidianIconProps {
  iconName: string
  isActive?: boolean
  size?: number
  className?: string
  [key: string]: any
}

export default function ObsidianIcon(props: ObsidianIconProps) {
  let { iconName, isActive, size, className, ...rest } = props
  size = size || 18
  className = className || ''
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (containerRef.current && !containerRef.current.firstChild) {
      const svg = getIcon(iconName)!
      containerRef.current.appendChild(svg)
    }
  }, [])

  const classes = classNames('clickable-icon', { active: isActive }, className)
  const styles = css`
    &.active {
      color: var(--color-accent);
    }
    .svg-icon {
      height: ${size}px;
      width: ${size}px;
    }
  `

  return (
    <div className={classes} css={styles} ref={containerRef} {...rest} />
  )
}
