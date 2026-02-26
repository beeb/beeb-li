import adapter from '@sveltejs/adapter-vercel'
import { h } from 'hastscript'
import { escapeSvelte, mdsvex } from 'mdsvex'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import remarkAbbr from 'remark-abbr'
import remarkToc from 'remark-toc'
import { createHighlighter } from 'shiki'

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

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		experimental: {
			async: true,
		},
	},

	// Ensures both .svelte and .md files are treated as components (can be imported and used anywhere, or used as pages)
	extensions: ['.svelte', '.md'],

	preprocess: [
		mdsvex({
			// The default mdsvex extension is .svx; this overrides that.
			extensions: ['.md'],

			remarkPlugins: [remarkAbbr, remarkToc],

			// Adds IDs to headings, and anchor links to those IDs. Note: must stay in this order to work.
			rehypePlugins: [
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'append',
						content(_) {
							return [
								h(
									'span',
									'<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24"><g fill="none"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M10.232 10.231a5 5 0 0 1 6.89-.172l.181.172l2.828 2.829a5 5 0 0 1-6.89 7.243l-.18-.172l-2.122-2.122a1 1 0 0 1 1.32-1.497l.094.083l2.122 2.122a3 3 0 0 0 4.377-4.1l-.135-.143l-2.828-2.828a3 3 0 0 0-4.243 0a1 1 0 0 1-1.414-1.415M3.868 3.867a5 5 0 0 1 6.89-.172l.181.172L13.06 5.99a1 1 0 0 1-1.32 1.497l-.094-.083l-2.121-2.121A3 3 0 0 0 5.147 9.38l.135.144l2.829 2.829a3 3 0 0 0 4.242 0a1 1 0 1 1 1.415 1.414a5 5 0 0 1-6.89.172l-.182-.172l-2.828-2.829a5 5 0 0 1 0-7.07Z"/></g></svg>',
								),
							]
						},
						headingProperties: {
							style: 'display: flex; flex-wrap: wrap; align-items: center; column-gap: 0.5rem',
						},
						properties: {
							ariaHidden: true,
							tabIndex: -1,
							title: 'Link to this heading',
						},
					},
				],
				rehypeExternalLinks,
			],

			highlight: {
				highlighter: async (code, lang = 'text') => {
					const html = escapeSvelte(
						highlighter.codeToHtml(code, {
							lang,
							themes: { light: 'catppuccin-latte', dark: 'catppuccin-mocha' },
							transformers: [
								{
									pre(node) {
										node.properties.dataLanguage = lang
									},
									root(node) {
										// Wrap the pre element in a div with class="relative"
										node.children = [
											{
												type: 'element',
												tagName: 'div',
												properties: { class: 'relative' },
												children: node.children,
											},
										]
									},
								},
							],
						}),
					)
					return `{@html \`${html}\` }`
				},
			},
		}),
	],

	kit: {
		adapter: adapter(),
		prerender: {
			entries: ['*'],
			handleHttpError: 'warn',
			origin: `https://${prodUrl}`,
		},
	},
}

export default config
