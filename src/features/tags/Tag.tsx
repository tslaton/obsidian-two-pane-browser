// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import { useAppDispatch } from '../../plugin/hooks'
import { TagFilter, toggleTagFilter } from './tagFiltersSlice'

interface TagProps {
	name: string
	style?: Record<string, string>
	status?: 'include' | 'exclude' | null
}

export default function Tag(props: TagProps) {
  const { name, style, status } = props
	console.log('tag: ', name, 'status: ', status)
	const dispatch = useAppDispatch()

	function onClick() {
		// TODO: fix this jank
		if (style !== undefined) {
			dispatch(toggleTagFilter(name))
		}
	}

	const plainName = name.substring(1)
	const tagBeginClasses = `
		cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta cm-tag-${plainName}
	`
	const tagEndClasses = `
		cm-hashtag cm-hashtag-end cm-meta cm-tag-${plainName}
	`

  return (
		<StyledTag className="tag-filter" onClick={onClick} {...props}>
			<span className={tagBeginClasses}>#</span>
			<span className={tagEndClasses}>{plainName}</span>
		</StyledTag>
  )
}

const StyledTag = styled.div<TagProps>`
	${props => props.status && 
		`span {
			color: ${props.status === 'include' ? 'white' : props.status === 'exclude' ? 'var(--text-faint)' : 'initial' };
			text-decoration: ${props.status === 'exclude' ? 'line-through' : 'initial'};
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