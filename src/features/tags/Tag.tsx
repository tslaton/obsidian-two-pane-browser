// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import { useAppSelector } from '../../plugin/hooks'
import { selectStylesByTag } from '../settings/settingsSlice'

// FUTURE: think about how these work with editor extensions:
// https://marcus.se.net/obsidian-plugin-docs/editor/extensions
// https://marcus.se.net/obsidian-plugin-docs/editor/extensions/decorations
// Looks like I could do styling in JS or CSS
// JS makes it easier to add dynamic/arbitrary CSS to tags
// CSS seems slighly simpler/cleaner
// Probably I'd store these in the settings and let the user create new ones
export interface TagStyle {
  text: string
  pill: string
}

export const tagStyles = {
	'berry-red': { pill: '#b8256f', text: 'white' },
	'red': { pill: '#db4035', text: 'white' },
	'orange': { pill: '#ff9933', text: 'black' },
	'yellow': { pill: '#fad000', 'text': 'black' },
	'olive-green': { pill: '#afb83b', text: 'black' },
	'lime-green': { pill: '#7ecc49', text: 'black' },
	'green': { pill: '#299438', text: 'white' },
	'mint-green': { pill: '#6accbc', text: 'black' },
	'teal': { pill: '#158fad', text: 'white' },
	'sky-blue': { pill: '#14aaf5', text: 'white' },
	'light-blue': { pill: '#96c3eb', text: 'black' },
	'blue': { pill: '#4073ff', text: 'white' },
	'grape': { pill: '#884dff', text: 'white' },
	'violet': { pill: '##af38eb', text: 'white' },
	'lavender': { pill: '#eb96eb', text: 'black' },
	'magenta': { pill: '#e05194', text: 'white' },
	'salmon': { pill: '#ff8d85', text: 'black' },
	'charcoal': { pill: '#808080', text: 'white' },
	'gray': { pill: '#b8b8b8', text: 'black' },
	'taupe': { pill: '#ccac93', text: 'black' },
}

export function createTagStyle({ text, pill }: TagStyle) {
  return `
    color: ${text};
    background-color: ${pill};
    padding: 0px 8px 2px 8px;
    border-radius: 10px;
  `
}

interface TagProps {
  tag: string
}

export default function Tag(props: TagProps) {
  const { tag } = props
  const stylesByTag = useAppSelector(selectStylesByTag)

  return (
    <div css={css`
      ${createTagStyle(stylesByTag[tag] || tagStyles.gray)}
      margin-left: 4px;
    `}>
      {tag}      
    </div>
  )
}
