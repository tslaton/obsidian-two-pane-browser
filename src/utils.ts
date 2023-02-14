// Libraries
import { 
  TFile, 
  MetadataCache,
  getAllTags,
} from 'obsidian'

// https://stackoverflow.com/a/71896674
export function getTags(files: TFile[], metadataCache: MetadataCache) {
  const allTags: string[] = []
  files.forEach(file => {
    const fileCache = metadataCache.getFileCache(file)
    if (fileCache) {
      const tags = getAllTags(fileCache) || []
      for (let tag of tags) {
        allTags.push(tag)
      }
    }
  })
  return [... new Set(allTags)]
}

export function recurseChildren(obj: any, callback: (child: any) => void) {
  if (!obj) {
    return
  }
  for (let child of obj.children || []) {
    callback(child)
    recurseChildren(child, callback)
  }
}
