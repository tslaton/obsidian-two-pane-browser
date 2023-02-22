// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppSelector } from '../../plugin/hooks'
import { TwoPaneBrowserSettings, TagCategoryStyle, selectSettings } from './settingsSlice'
import { deepcopy } from '../../utils'

interface TagCategorySettingsProps {
  name: string
  style: TagCategoryStyle
  tags: string[]
}

export default function TagCategorySettings(props: TagCategorySettingsProps) {
  const { name: initialName, style, tags: initialTags } = props
  const [name, setName] = React.useState(initialName)
  const [color, setColor] = React.useState(style.color)
  const [tagAsString, setTagAsString] = React.useState(initialTags.join(' '))
  const settings = useAppSelector(selectSettings)
  const plugin = React.useContext(PluginContext)

  function onSubmitUpdateTagCategory(event: React.FormEvent) {
    event.preventDefault()
    const newSettings = deepcopy(settings) as TwoPaneBrowserSettings
    const categoryMeta = newSettings.tagCategories[initialName]
    categoryMeta.style = { color }
    categoryMeta.tags = tagAsString.split(' ').map(tag => tag.trim()).filter(tag => tag.startsWith('#'))
    delete newSettings.tagCategories[initialName]
    newSettings.tagCategories[name] = categoryMeta
    plugin.saveSettings(newSettings)
  }

  function onChangeName(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
  }

  function onChangeColor(event: React.ChangeEvent<HTMLInputElement>) {
    setColor(event.target.value)
  }

  function onChangeTagsAsString(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setTagAsString(event.target.value)
  }
  
  return (
    <StyledTagCategorySettings>
      <form onSubmit={onSubmitUpdateTagCategory}>
        <div className="update-tag-category-inputs">
          <input 
            type="text" 
            placeholder={`Rename ${initialName}`} 
            value={name}
            onChange={onChangeName}
          />
          <input 
            type="color" 
            value={color}
            onChange={onChangeColor}
          />
        </div>
        <textarea
          rows={8} 
          cols={60}
          placeholder="Enter tags, separated by spaces and including #" 
          value={tagAsString}
          onChange={onChangeTagsAsString}
        />
        <button type="submit">Save</button>
      </form>
    </StyledTagCategorySettings>
  )
}

const StyledTagCategorySettings = styled.div`
  margin-bottom: 10px;

  .update-tag-category-inputs {
    display: flex;
    flex-direction: horizontal;
    align-items: flex-start;
    gap: 10px;
  }

  .update-tag-category-inputs, textarea {
    margin-bottom: 10px;
  }
`
