// Libraries
import * as React from 'react'
// Modules
import { TagFilter } from './tagFiltersSlice'

interface TagProps {
	name?: string
	filterState?: TagFilter
}

export default function Tag(props: TagProps) {
  let { name, filterState } = props
	if (filterState) {
		name = filterState.name
	}
	name = name!.substring(1)
	const tagBeginClasses = `
		cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta cm-tag-${name}
	`
	const tagEndClasses = `
		cm-hashtag cm-hashtag-end cm-meta cm-tag-${name}
	`

  return (
		<div className="tag">
			<span className={tagBeginClasses}>#</span>
			<span className={tagEndClasses}>{name}</span>
		</div>
  )
}

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