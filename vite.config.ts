import type { UserConfig, Plugin } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import arraybuffer from 'vite-plugin-arraybuffer'
import { imagetools, type VitePluginOptions } from 'vite-imagetools'
import Icons from 'unplugin-icons/vite'

const config: UserConfig = {
	plugins: [
		enhancedImages(),
		sveltekit(),
		arraybuffer(),
		base64Image(),
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

function base64Image(): Plugin[] {
	const imagetoolsInstance = imagetoolsPlugin()
	return [base64Plugin(imagetoolsInstance), imagetoolsInstance]
}

function imagetoolsPlugin() {
	const imagetoolsOpts: Partial<VitePluginOptions> = {
		defaultDirectives: async ({ pathname, searchParams: qs }, metadata) => {
			if (!qs.has('base64image')) return new URLSearchParams()

			const imgWidth = qs.get('width')
			const width = imgWidth ? Number.parseInt(imgWidth) : (await metadata()).width
			if (!width) {
				console.warn(`Could not determine width of image ${pathname}`)
				return new URLSearchParams()
			}

			return new URLSearchParams({
				format: 'jpg',
				w: `${width}`,
			})
		},
		namedExports: false,
	}

	return imagetools(imagetoolsOpts)
}

function base64Plugin(imagetoolsPlugin: Plugin): Plugin {
	return {
		name: 'vite-plugin-base64-image',
	}
}

export default config
