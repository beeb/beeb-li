import { siteTitle } from '$lib/config'
import { fetchPosts } from '$lib/posts'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import logo from '../../../../../static/favicon.svg?raw'
import fontBlack from '../../../../../static/fonts/tasa-orbiter-display-black.otf?arraybuffer'
import font from '../../../../../static/fonts/tasa-orbiter-display-semibold.otf?arraybuffer'
import type { RequestHandler } from './$types'

export const prerender = true

export const entries = async () => {
	const { posts } = await fetchPosts({ limit: -1 })
	return posts.map((p) => ({ post: p.slug }))
}

const logoData = btoa(logo)

export const GET: RequestHandler = async ({ url, params }) => {
	const post: Post = await import(`../../../../lib/posts/${params.post}.md`)

	const svg = await satori(
		{
			type: 'div',
			props: {
				tw: 'flex flex-col justify-end items-start p-16 pb-28 w-full h-full text-7xl text-white',
				style: {
					backgroundColor: '#0a0b10',
				},
				children: [
					{
						type: 'div',
						props: {
							tw: 'absolute left-16 top-16 flex items-center text-6xl font-extrabold',
							style: {
								color: '#00ffbc',
							},
							children: [
								{
									type: 'img',
									props: {
										tw: 'mr-4',
										src: `data:image/svg+xml;base64,${logoData}`,
										width: 75,
										height: 75,
									},
								},
								siteTitle,
							],
						},
					},
					{
						type: 'div',
						props: {
							tw: 'absolute right-16 top-16 text-3xl p-2 text-white',
							children: url.host,
						},
					},
					{
						type: 'div',
						props: {
							tw: 'absolute bottom-16 left-16 w-full h-2',
							style: {
								backgroundColor: '#00ffbc',
							},
						},
					},
					post.metadata.title,
				],
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'TASA Orbiter',
					data: font,
					weight: 600,
					style: 'normal',
				},
				{
					name: 'TASA Orbiter',
					data: fontBlack,
					weight: 800,
					style: 'normal',
				},
			],
		},
	)

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width' as const,
			value: 1200,
		},
		font: {
			loadSystemFonts: false,
		},
	})
	const pngData = resvg.render()
	const pngBuffer = pngData.asPng()

	return new Response(pngBuffer, {
		status: 200,
		headers: {
			'cache-control': 'public, immutable, no-transform, max-age=31536000',
			'content-type': 'image/png',
		},
	})
}
