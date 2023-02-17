// Given the name and path for a file or folder, return its parent's path
export function getParentPath(name: string, path: string) {
  return path.substring(0, path.lastIndexOf(name) - 1)
}

export function deepcopy(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}
