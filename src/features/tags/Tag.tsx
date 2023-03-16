// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
import classNames from 'classnames'
// Modules
import { useAppDispatch } from '../../plugin/hooks'
import { TagFilter, toggleTagFilter } from './tagFiltersSlice'
import { alphaColor } from '../../utils'

export default function Tag(props: TagFilter) {
  const { name, color, status } = props
	const dispatch = useAppDispatch()

	function onClick() {
		if (status !== undefined) {
			dispatch(toggleTagFilter(name))
		}
	}

	const plainName = name.substring(1)
	const _tagBeginClasses = `
		cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta cm-tag-${plainName}
	`
	const _tagEndClasses = `
		cm-hashtag cm-hashtag-end cm-meta cm-tag-${plainName}
	`
	const tagBeginClasses = status 
	  ? `${_tagBeginClasses} ${status}`
	  : _tagBeginClasses

	const tagEndClasses = status
	  ? `${_tagEndClasses} ${status}`
	  : _tagEndClasses

	const identifyingClassName = status === undefined
		? 'tag'
		: 'tag-filter'

	const styles = css`
		&.tag {
			cursor: pointer;
		}

		&.tag-filter:hover {
			span {
				background-color: ${color ? alphaColor(color, 0.2) : 'hsla(var(--color-accent-hsl), 0.2)'};
			}
		}

		span.include {
			border-color: ${color ? color : 'var(--color-accent)'};

			&.cm-hashtag-begin {
				border-width: 2px 0 2px 2px;
			}

			&.cm-hashtag-end {
				border-width: 2px 2px 2px 0;
			}
		}

		span.exclude {
			color: var(--text-faint);
			text-decoration: line-through;
		}
	`

  return (
		<div className={identifyingClassName} css={styles} onClick={onClick}>
			<span className={tagBeginClasses}>#</span>
			<span className={tagEndClasses}>{plainName}</span>
		</div>
  )
}

// Obsidian CSS vars
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