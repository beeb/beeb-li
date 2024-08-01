const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	safelist: [{ pattern: /^col-start-/, variants: ['first'] }],
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
				light: {
					...require('daisyui/src/theming/themes').light,
					primary: 'oklch(56.47% 0.15 165.54020059855623)', // fallback #008b65
					secondary: 'oklch(47.46% 0.236 275.52)', // #4338DC
					accent: 'oklch(58.6% 0.20652206686512864 34.80732361610484)', // #DB3700
					info: 'oklch(56.21% 0.128 239.83)', // #027db8
					success: 'oklch(55.04% 0.148 131.24)', // #518208
					warning: 'oklch(56.33% 0.115 85.35)', // #946F00
					error: 'oklch(58.29% 0.234 28.71)', // #E51010
				},
			},
			{
				dark: {
					...require('daisyui/src/theming/themes').dark,
					'base-content': 'oklch(87% 0.011 269.54)', // #d1d4dc
					primary: 'oklch(88.64% 0.18503473995249034 165.54020059855623)', // #00ffbc
					secondary: 'oklch(64.48% 0.156 284.08)', // #847de8
					accent: 'oklch(65.43% 0.227 35.17)', // #fc4404
					info: 'oklch(68.47% 0.148 237.32)', // #0ea5e9
					success: 'oklch(76.81% 0.204 130.85)', // #84cc16
					warning: 'oklch(79.52% 0.162 86.05)', // #eab308
					error: 'oklch(66.61% 0.175 23.1)', // #ec5f5f
				},
			},
		],
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
