// Libraries
import { TFile, MetadataCache, getAllTags } from 'obsidian'

// https://stackoverflow.com/a/71896674
export function getTags(file: TFile, metadataCache: MetadataCache) {
  const allTags = new Set<string>()
  const fileCache = metadataCache.getFileCache(file)
  if (fileCache) {
    const tags = getAllTags(fileCache) || []
    for (let tag of tags) {
      allTags.add(tag)
    }
  }
  return [...allTags]
}

// TODO: delete?
export function recurseChildren(obj: any, callback: (child: any) => void) {
  if (!obj) {
    return
  }
  for (let child of obj.children || []) {
    callback(child)
    recurseChildren(child, callback)
  }
}

// Given the name and path for a file or folder, return its parent's path
export function getParentPath(name: string, path: string) {
  return path.substring(0, path.lastIndexOf(name) - 1)
}
