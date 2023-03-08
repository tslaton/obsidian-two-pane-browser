// Libraries
import * as React from 'react'
import styled from '@emotion/styled'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppSelector } from '../../plugin/hooks'
import { TwoPaneBrowserSettings, TagCategory, selectSettings } from './settingsSlice'
import { deepcopy } from '../../utils'

export default function TagCategorySettings({ tagCategory }: { tagCategory: TagCategory }) {
  const { name: initialName, style, tagNames: initialTagNames } = tagCategory
  const [name, setName] = React.useState(initialName)
  const [color, setColor] = React.useState(style.color)
  const [tagNamesAsString, setTagNamesAsString] = React.useState(initialTagNames.join(' '))
  const settings = useAppSelector(selectSettings)
  const plugin = React.useContext(PluginContext)

  function onSubmitUpdateTagCategory(event: React.FormEvent) {
    event.preventDefault()
    const newSettings = deepcopy(settings) as TwoPaneBrowserSettings
    const tagCategory = newSettings.tagCategories[initialName]
    tagCategory.name = name
    tagCategory.style = { color }
    tagCategory.tagNames = tagNamesAsString.split(' ').map(t => t.trim()).filter(t => t.startsWith('#'))
    delete newSettings.tagCategories[initialName]
    newSettings.tagCategories[name] = tagCategory
    plugin.saveSettings(newSettings)
  }

  function onChangeName(event: React.ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
  }

  function onChangeColor(event: React.ChangeEvent<HTMLInputElement>) {
    setColor(event.target.value)
  }

  function onChangeTagNamesAsString(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setTagNamesAsString(event.target.value)
  }

  function onDeleteCategory() {
    const newSettings = deepcopy(settings) as TwoPaneBrowserSettings
    delete newSettings.tagCategories[initialName]
    plugin.saveSettings(newSettings)
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
          value={tagNamesAsString}
          onChange={onChangeTagNamesAsString}
        />
        <div className="update-tag-category-inputs">
          <button type="submit">Save</button>
          <button 
            type="button"
            className="mod-warning"
            onClick={onDeleteCategory}
          >
            Delete Category
          </button>
        </div>
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
