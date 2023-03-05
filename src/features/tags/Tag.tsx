// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { useAppDispatch } from '../../plugin/hooks'
import { TagFilter, toggleTagFilter } from './tagFiltersSlice'

interface TagProps {
	name?: string
	filterState?: TagFilter
}

export default function Tag(props: TagProps) {
  let { name, filterState } = props
	if (filterState) {
		name = filterState.name
	}
	const dispatch = useAppDispatch()

	function onClick() {
		if (filterState) {
			dispatch(toggleTagFilter(filterState.name))
		}
	}

	name = name!.substring(1)
	const tagBeginClasses = `
		cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta cm-tag-${name}
	`
	const tagEndClasses = `
		cm-hashtag cm-hashtag-end cm-meta cm-tag-${name}
	`

  return (
		<StyledTag className="tag-filter" onClick={onClick} {...props}>
			<span className={tagBeginClasses}>#</span>
			<span className={tagEndClasses}>{name}</span>
		</StyledTag>
  )
}

const StyledTag = styled.div<TagProps>`
	${props => props.filterState?.status && 
		`span {
			color: ${props.filterState?.status === 'include' ? 'white' : props.filterState?.status === 'exclude' ? 'var(--text-faint)' : 'initial' };
			text-decoration: ${props.filterState?.status === 'exclude' ? 'line-through' : 'initial'};
		}`
	}
`

// --tag-size: var(--font-smaller);
// --tag-color: var(--text-accent);
// --tag-color-hover: var(--text-accent);
// --tag-decoration: none;
// --tag-decoration-hover: none;
// --tag-background: hsla(var(--interactive-accent-hsl), 0.1);
// --tag-background-hover: hsla(var(--interactive-accent-hsl), 0.2);
// --tag-border-color: hsla(var(--interactive-accent-hsl), 0.15);
// --tag-border-color-hover: hsla(var(--interactive-accent-hsl), 0.15);
// --tag-border-width: 0px;
// --tag-padding-x: 0.65em;
// --tag-padding-y: 0.25em;
// --tag-radius: 2em;