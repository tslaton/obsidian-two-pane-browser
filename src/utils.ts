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
