interface FileLike {
  name: string
  path: string
}

// Given the name and path for a file or folder, return its parent's path
export function getParentPath({ name, path }: FileLike) {
  return path.substring(0, path.lastIndexOf(name) - 1)
}

export function getChildPaths(path: string, candidatePaths: string[]) {
  const pathLength = path.split('/').length
  const childPaths = []
  for (let candidatePath of candidatePaths) {
    const candidatePathLength = candidatePath.split('/').length
    if (candidatePathLength === pathLength + 1 && candidatePath.startsWith(path)) {
      childPaths.push(candidatePath)
    }
  }
  return childPaths
}

export function getDescendantPaths(path: string, candidatePaths: string[]) {
  const descendantPaths = []
  for (let candidatePath of candidatePaths) {
    if (candidatePath !== path && candidatePath.startsWith(path)) {
      descendantPaths.push(candidatePath)
    }
  }
  return descendantPaths
}

export function deepcopy(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

export function isSubset(a: Iterable<any>, b: Iterable<any>) {
  const _a = a instanceof Array ? a : [...a]
  const _b = b instanceof Set ? b : new Set(b)
  return _a.every(value => _b.has(value))
}

export function intersection(a: Iterable<any>, b: Iterable<any>) {
  const _a = a instanceof Array ? a : [...a]
  const _b = b instanceof Set ? b : new Set(b)
  return new Set(_a.filter(x => _b.has(x)))
}

// Unused...
export function areSetsEqual(a: Set<any>, b: Set<any>) {
  return a.size === b.size && isSubset(a, b)
}

export function rgbFromHex(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {}
}

export function alphaColor(hex: string, alpha=0.1) {
  const { r, g, b } = rgbFromHex(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

export function selectElementContent(element: HTMLElement) {
  requestAnimationFrame(() => {
    getSelection()?.selectAllChildren(element)
  })
}

export function clearSelection() {
  requestAnimationFrame(() => {
    getSelection()?.empty()
  })
}

export function collapseWhitespace(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

export function stripHashtags(text: string) {
  return text.replace(/#\S+/g, '')
}

// Ref: https://stackoverflow.com/a/18647776/8593354
// Split a query containing words and possibly quoted elements into tokens
export function tokenizeQuery(query: string) {
  const tokens = []
  const regex = /[^\s"]+|"([^"]*)"/gi
  let match
  while ( (match = regex.exec(query)) ) {
    // Index 1 in the array is the captured group (quotes) if it exists
    // Index 0 is the matched text, which we use if no captured group exists
    tokens.push(match[1] ? match[1] : match[0])
  }
  return tokens
}

export function getMatchingCoordinatePairs(regex: RegExp, contents: string) {
  const matchingCoordinatePairs: number[][] = []
  let match
  while ( (match = regex.exec(contents)) ) {
    // @ts-ignore https://github.com/tc39/proposal-regexp-match-indices
    if (match.indices) {
      // @ts-ignore
      matchingCoordinatePairs.push(...match.indices)
    }
  }
  return matchingCoordinatePairs
}

// [[14, 27], [11, 16], [13, 31], [4, 7]] => [[4, 7], [11, 31]]
export function dedupeCoordinatePairs(coordinatePairs: number[][]) {
  const dedupedPairs: number[][] = []
  // Sorted in reverse, for future popping
  const sortedPairs = coordinatePairs.slice().sort((a, b) => b[0] - a[0])
  let pair
  while ( (pair = sortedPairs.pop()) ) {
    let [start, end] = pair
    let otherPair
    while ( (otherPair = sortedPairs.at(-1)) ) {
      let [i, j] = otherPair
      if (i < end) {
        end = Math.max(end, j)
        // Combine these two into larger range
        sortedPairs.pop()
      }
      else {
        break
      }
    }
    dedupedPairs.push([start, end])
  }
  return dedupedPairs
}

export interface SearchResult {
  text: string
  textOffset: number
  matchingCoordinatePairs: number[][]
}

export function getSearchResults(coordinatePairs: number[][], sourceText: string, maxSeparation=40) {
  // dedupedCoordinatePairs are non-overlapping
  const dedupedCoordinatePairs = dedupeCoordinatePairs(coordinatePairs)
  const results: SearchResult[] = []
  let contextCoordinatePairs = []
  let pair
  // Join any pairs that are < maxSeparation apart in the same context
  while ( (pair = dedupedCoordinatePairs.pop()) ) {
    let [start, end] = pair
    let otherPair
    while ( (otherPair = dedupedCoordinatePairs.at(-1)) ) {
      let [i, j] = otherPair
      const [a, b] = [Math.min(start, i), Math.max(end, j)]
      const candidateContext = sourceText.substring(a, b)
      const firstLine = candidateContext.match(/.+$/m)?.toString()
      // Only join results within the same line, less than maxSeparation apart
      if (candidateContext === firstLine && b - a < maxSeparation) {
        [start, end] = [a, b]
        dedupedCoordinatePairs.pop()
      }
      else {
        break
      }
    }
    // Expand the context, if necessary
    if ( (end - start) < maxSeparation ) {
      const match = sourceText.substring(start, end)
      const regex = new RegExp(String.raw`(\S+[^\S\r\n]+){0,2}(?:${match})([^\S\r\n]+\S+){0,2}`)
      regex.lastIndex = Math.max(start - 20, 0)
      const _match = regex.exec(sourceText)
      const context = _match ? _match[0].toString() : match
      console.log('sourceText: ', sourceText)
      console.log('match: ', match)
      console.log('regex: ', regex)
      console.log('context: ', context)
      results.push({
        text: context,
        textOffset: start + (context.indexOf(match) || 0),
        matchingCoordinatePairs: coordinatePairs,
      })
    }
    // contextCoordinatePairs.push([start, end])
  }
  return results
}
