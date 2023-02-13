// Libraries
import { 
  TFile, 
  MetadataCache,
  getAllTags,
} from 'obsidian'

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
