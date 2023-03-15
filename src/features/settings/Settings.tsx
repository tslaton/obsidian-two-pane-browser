// Libraries
import * as React from 'react'
import { css } from '@emotion/react'
// Modules
import PluginContext from '../../plugin/PluginContext'
import { useAppSelector } from '../../plugin/hooks'
import TagCategorySettings from './TagCategorySettings'
import { TwoPaneBrowserSettings, selectSettings } from './settingsSlice'
import { deepcopy } from '../../utils'

export default function Settings() {
  const plugin = React.useContext(PluginContext)
  const settings = useAppSelector(selectSettings)
  const tagCategories = Object.values(settings.tagCategories).sort((a, b) => a.name.localeCompare(b.name))
  const [newTagCategory, setNewTagCategory] = React.useState('')
  const [newTagCategoryColor, setNewTagCategoryColor] = React.useState('#ffffff')

  function onChangeNewTagCategory(event: React.ChangeEvent<HTMLInputElement>) {
    setNewTagCategory(event.target.value)
  }

  function onChangeNewTagColor(event: React.ChangeEvent<HTMLInputElement>) {
    setNewTagCategoryColor(event.target.value)
  }

  // TODO: handle the case where a category already exists (don't overwrite it)
  function onSubmitAddTagCategory(event: React.FormEvent) {
    event.preventDefault()
    const newSettings = deepcopy(settings) as TwoPaneBrowserSettings
    const name = newTagCategory || 'Unnamed Category'
    newSettings.tagCategories[name] = {
      name,
      style: { color: newTagCategoryColor },
      tagNames: [],
    }
    plugin.saveSettings(newSettings)
  }

  return (
    <div css={styles.self}>
      <h2>Settings for Two-Pane Browser</h2>
      <h3>Tag Categories</h3>
      {tagCategories.map(tagCategory =>
        <TagCategorySettings 
          key={tagCategory.name}
          tagCategory={tagCategory}
        />
      )}
      <hr />
      <form className="new-tag-category-form" onSubmit={onSubmitAddTagCategory}>
        <input 
          type="text" 
          name="new-tag-category" 
          placeholder="Enter tag category..." 
          value={newTagCategory}
          onChange={onChangeNewTagCategory}
        />
        <input 
          type="color" 
          name="new-tag-category-color"
          value={newTagCategoryColor}
          onChange={onChangeNewTagColor}
        />
        <button type="submit">Add new tag category</button>
      </form>
    </div>
  )
}

const styles = {
  self: css`
    .new-tag-category-form {
      display: flex;
      flex-direction: horizontal;
      align-items: flex-start;
      gap: 10px;
    }

    label, input, button {
      display: block;
    }

    input[type="text"] {
      width: 240px;
    }

    input[type="color"] {
      padding-top: 3px;
    }
  `,
}
