const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	theme: {
		fontFamily: {
			sans: ['TASA Orbiter', ...defaultTheme.fontFamily.sans],
			mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
		},
		extend: {},
	},
	daisyui: {
		themes: [
			{
				dark: {
					...require('daisyui/src/theming/themes').dark,
					'base-content': '#d1d4dc',
					primary: '#00ffbc',
					secondary: '#847de8',
					accent: '#fc4404',
					info: '#0ea5e9',
					success: '#84cc16',
					warning: '#eab308',
					error: '#ec5f5f',
				},
			},
		],
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
