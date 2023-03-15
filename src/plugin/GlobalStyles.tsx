// Libraries
import { css, Global } from '@emotion/react'
// Modules
import { useAppSelector } from './hooks'
import { selectTagCategoryByTagName } from '../features/tags/tagFiltersSlice'
import { alphaColor } from '../utils'

export default function GlobalStyles() {
  const tagCategoryByTagName = useAppSelector(selectTagCategoryByTagName)
  let tagsCSS = ''
  for (let [tagName, { style }] of Object.entries(tagCategoryByTagName)) {
    tagName = tagName.substring(1)
    tagsCSS += `.cm-tag-${tagName} { 
      color: ${style.color}; 
      background-color: ${alphaColor(style.color)} 
    }`
  }

  return (
    <Global styles={css`    
      :root {
        --two-pane-browser-gutter: 12px;
      }
      
      ${tagsCSS}
      
      /* disable default padding on two-pane-browser-view */ 
      div.workspace-leaf-content[data-type="two-pane-browser"] > div.view-content {
        padding: 0;
      }

      /* similar to default nav-folder-title and nav-file-title */
      div.nav-item {
        color: var(--nav-item-color);
        font-weight: var(--nav-item-weight);
      }

      div.nav-item.is-selected {
        color: var(--nav-item-color-selected);
        background-color: var(--nav-item-background-selected);
      }

      div.nav-item.is-active {
        color: var(--nav-item-color-active);
        background-color: var(--nav-item-background-active);
        font-weight: var(--nav-item-weight-active);
      }

      div.nav-item:not(.is-active, .is-selected):hover {
        color: var(--nav-item-color-hover);
        background-color: var(--nav-item-background-hover);
      }

      div.file-count {
        line-height: 24px;
        color: var(--text-faint);
      }
  `} />
  )
}