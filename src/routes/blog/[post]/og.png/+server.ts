import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import type { RequestHandler } from './$types'
import logo from '../../../../../static/favicon.svg?raw'
import font from '../../../../../static/fonts/tasa-orbiter-display-semibold.otf?arraybuffer'
import fontBlack from '../../../../../static/fonts/tasa-orbiter-display-black.otf?arraybuffer'
import { siteTitle } from '$lib/config'
import fetchPosts from '$lib/fetchPosts'

export const prerender = true

export const entries = async () => {
	const { posts } = await fetchPosts({ limit: -1 })
	return posts.map((p) => ({ post: p.slug }))
}

const logoData = btoa(logo)

export const GET: RequestHandler = async ({ url, params }) => {
	const post: Post = await import(`../../../../lib/posts/${params.post}.md`)

	const image = post.metadata.coverImage
		? (await import(`../../../../lib/posts/${params.post}/title.jpg?enhanced&w=1200`)).default
		: null

	let imageData = null
	// if (post.metadata.coverImage) {
	// 	const buffer = (await import(`../../../../lib/posts/${params.post}/title.jpg?arraybuffer`)).default
	// 	const bytes = new Uint8Array(buffer)
	// 	imageData = btoa(String.fromCharCode(...bytes))
	// }

	const divStyle = imageData
		? {
				backgroundImage: `linear-gradient(to bottom, #00000088, #000000cc), url("data:image/jpeg;base64,")`,
			}
		: {
				backgroundColor: '#1d232a',
			}

	const svg = await satori(
		{
			type: 'div',
			props: {
				tw: 'flex flex-col justify-end items-start p-16 pb-28 w-full h-full text-7xl text-white',
				style: divStyle,
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
							tw: 'absolute right-16 top-16 text-3xl rounded-lg bg-black/50 p-2 text-white',
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
