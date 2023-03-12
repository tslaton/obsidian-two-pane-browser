// Libraries
import { MarkdownRenderer } from 'obsidian'
import * as React from 'react'
import { css } from '@emotion/react'

interface ObsidianMarkdownProps {
  content: string
  path: string
}

export default function ObsidianMarkdown(props: ObsidianMarkdownProps) {
  const { content, path } = props
  const ref = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const render = async () => {
      if (ref.current) {
        ref.current.replaceChildren()
        await MarkdownRenderer.renderMarkdown(content, ref.current, path, null as any)
        // Post-processing
        let p = ref.current.querySelector('p')
        if (!p) {
          p = document.createElement('p')
          ref.current.appendChild(p)
        }
        let h1
        while (h1 = ref.current.querySelector('h1')) {
          ref.current.removeChild(h1)
          p.innerHTML = `${h1.textContent}<br>${p.innerHTML}`
        }
      }
    }
    render()
  }, [content])
  
  return (
    <div ref={ref} css={css`
      p {
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `} />
  )
}
