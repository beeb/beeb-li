import type { UserConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import Icons from 'unplugin-icons/vite'

const config: UserConfig = {
	plugins: [
		enhancedImages(),
		sveltekit(),
		Icons({
			compiler: 'svelte',
		}),
	],
	server: {
		fs: {
			allow: ['.'],
		},
	},
}

export default config
