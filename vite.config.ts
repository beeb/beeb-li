import type { UserConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import arraybuffer from 'vite-plugin-arraybuffer'
import Icons from 'unplugin-icons/vite'

const config: UserConfig = {
	plugins: [
		enhancedImages(),
		sveltekit(),
		arraybuffer(),
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
