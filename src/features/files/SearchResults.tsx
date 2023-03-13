// Libraries
import * as React from 'react'
// Modules
import { FileSearchResults } from './filesSlice'
import ObsidianMarkdown from '../../common/ObsidianMarkdown'

export default function SearchResults(props: FileSearchResults) {
  let { score, titleMatches, contentMatches } = props
  titleMatches = titleMatches || []
  contentMatches = contentMatches || []

  return (
    <div>
      {contentMatches.map(({ text, textOffset, matchingCoordinatePairs }) => 
        <ObsidianMarkdown key={text} content={text} path="" />
      )}
    </div>
  )
}
