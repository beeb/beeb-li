/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: ['light', 'dark'],
	},
	darkMode: ['class', '[data-theme="dark"]'],
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
