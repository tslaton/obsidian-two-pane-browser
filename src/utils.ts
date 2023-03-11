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
  const matchingCoordinatePairs = []
  let match
  while ( (match = regex.exec(contents)) ) {
    // @ts-ignore https://github.com/tc39/proposal-regexp-match-indices
    if (match.indices) {
      // @ts-ignore
      matchingCoordinatePairs.push(match.indices)
    }
  }
  return matchingCoordinatePairs
}

// [[14, 27], [11, 16], [13, 31], [4, 7]] => [[4, 7], [11, 31]]
export function dedupeCoordinatePairs(coordinatePairs: number[][]) {
  if (coordinatePairs.length === 0) {
    return [[]]
  }
  console.log('deduping: ', coordinatePairs)
  const dedupedPairs = []
  // Sorted in reverse, for future popping
  const sortedPairs = coordinatePairs.sort((a, b) => b[0] - a[0])
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

// Assumes coordinatePairs has been deduped already
export function getSearchResults(coordinatePairs: number[][], sourceText: string, contextSize=150) {
  const results: SearchResult[] = []
  let contextCoordinatePairs = []
  for (let [begin, end] of coordinatePairs) {
    const contextBegin = Math.max(begin - contextSize, 0)
    const contextEnd = Math.min(end + contextSize, sourceText.length)
    contextCoordinatePairs.push([contextBegin, contextEnd])
  }
  // Join overlapping contexts
  contextCoordinatePairs = dedupeCoordinatePairs(contextCoordinatePairs)
  for (let [begin, end] of contextCoordinatePairs) {
    let context = sourceText.substring(begin, end)
    context = collapseWhitespace(context)
    const words = context.split(' ')
    context = words.slice(1).join(' ')
    // TODO: determine 
    // 1. how to ensure each context contains its matches
    // 2. the match indices still work after collapseWhitespace...
    results.push({
      text: context,
      textOffset: begin,
      matchingCoordinatePairs: coordinatePairs,
    })
  }
  return results
}
