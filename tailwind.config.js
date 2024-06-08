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
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
