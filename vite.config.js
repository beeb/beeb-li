import adapter from '@sveltejs/adapter-vercel'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { anchors } from '@mdsvex/plugin-anchors'
import { external_links } from '@mdsvex/plugin-external-links'
import { toc } from '@mdsvex/plugin-toc'
import { mdsvex } from 'mdsvex'
import { createHighlighter } from 'shiki'
import Icons from 'unplugin-icons/vite'
import arraybuffer from 'vite-plugin-arraybuffer'
import { abbr } from './src/lib/mdsvex/abbr.ts'
import { tocParts } from './src/lib/mdsvex/toc.ts'

const prodUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || 'beeb.li'

const highlighter = await createHighlighter({
	themes: ['catppuccin-latte', 'catppuccin-mocha'],
	langs: [
		'dockerfile',
		'fish',
		'html',
		'javascript',
		'json',
		'rust',
		'solidity',
		'svelte',
		'toml',
		'typescript',
		'yaml',
	],
})

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		enhancedImages(),
		mdsvex({
			extensions: ['.md'],
			heading_ids: true,
			smart_punctuation: true,
			plugins: [
				anchors({ position: 'append', attrs: { class: 'heading-anchor', title: 'Link to this heading' } }),
				toc({ max_depth: 6 }),
				external_links({ rel: ['nofollow'] }),
			],
			parse_plugins: [...abbr, tocParts],
			components: '#lib/mdsvex/components.ts',
			highlight: (code, { lang, inline }) => {
				if (inline) return null
				return highlighter.codeToHtml(code, {
					lang: lang || 'text',
					themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
					transformers: [
						{
							pre(node) {
								node.properties.dataLanguage = lang || 'text'
							},
							root(node) {
								// wrap the pre element in a div with class="relative"
								node.children = [
									{ type: 'element', tagName: 'div', properties: { class: 'relative' }, children: node.children },
								]
							},
						},
					],
				})
			},
		}),
		sveltekit({
			compilerOptions: {
				experimental: {
					async: true,
				},
			},

			// Ensures both .svelte and .md files are treated as components (can be imported and used anywhere, or used as pages)
			extensions: ['.svelte', '.md'],
			onwarn: (warning, handler) => {
				// shiki puts tabindex on pre so that code blocks can be scrolled with the keyboard
				if (warning.code === 'a11y_no_noninteractive_tabindex' && warning.filename?.endsWith('.md')) return
				handler(warning)
			},
			adapter: adapter(),
			paths: {
				origin: `https://${prodUrl}`,
			},
			prerender: {
				entries: ['*'],
				handleHttpError: 'warn',
			},
		}),
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
