import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import type { UserConfig } from 'vite'
import arraybuffer from 'vite-plugin-arraybuffer'

const config: UserConfig = {
	plugins: [
		enhancedImages(),
		sveltekit(),
		arraybuffer(),
		Icons({
			compiler: 'svelte',
		}),
		tailwindcss(),
	],
	server: {
		fs: {
			allow: ['.'],
		},
	},
}

export default config
