// TODO: clean up structure of this file vs. main.ts and view.tsx
export const tagColors = {
	'berry-red': { pill: '#b8256f', text: 'white' },
	'red': { pill: '#db4035', text: 'white' },
	'orange': { pill: '#ff9933', text: 'black' },
	'yellow': { pill: '#fad000', 'text': 'black' },
	'olive-green': { pill: '#afb83b', text: 'black' },
	'lime-green': { pill: '#7ecc49', text: 'black' },
	'green': { pill: '#299438', text: 'white' },
	'mint-green': { pill: '#6accbc', text: 'black' },
	'teal': { pill: '#158fad', text: 'white' },
	'sky-blue': { pill: '#14aaf5', text: 'white' },
	'light-blue': { pill: '#96c3eb', text: 'black' },
	'blue': { pill: '#4073ff', text: 'white' },
	'grape': { pill: '#884dff', text: 'white' },
	'violet': { pill: '##af38eb', text: 'white' },
	'lavender': { pill: '#eb96eb', text: 'black' },
	'magenta': { pill: '#e05194', text: 'white' },
	'salmon': { pill: '#ff8d85', text: 'black' },
	'charcoal': { pill: '#808080', text: 'white' },
	'gray': { pill: '#b8b8b8', text: 'black' },
	'taupe': { pill: '#ccac93', text: 'black' },
}
export const DEFAULT_SETTINGS = {
	tagsByColorName: Object.fromEntries(
		Object.keys(tagColors).map(colorName => [colorName, ''])
	),
}

export type TwoPaneBrowserSettings = Record<string, Record<string, string>>

