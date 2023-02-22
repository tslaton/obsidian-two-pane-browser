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

export function sortedEntries(obj: any) {
  return Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0]))
}

export function rgbFromHex(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {}
}
