import satori from 'satori'
import type { RequestHandler } from './$types'
import font from '../../../../../static/fonts/tasa-orbiter-display-semibold.otf?arraybuffer'
import fontBlack from '../../../../../static/fonts/tasa-orbiter-display-black.otf?arraybuffer'
import { siteTitle } from '$lib/config'

export const prerender = true

export const GET: RequestHandler = async ({ url, params }) => {
	const post: Post = await import(`../../../../lib/posts/${params.post}.md`)

	const image = post.metadata.coverImage
		? (await import(`../../../../lib/posts/${params.post}/title.jpg?enhanced&w=1200`)).default
		: null

	const divStyle = image
		? {
				backgroundImage: `linear-gradient(to bottom, #00000088, #000000cc), url("${url.origin}${image.img.src}")`,
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
										src: `${url.origin}/favicon.svg`,
										width: 75,
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

	return new Response(svg, {
		status: 200,
		headers: {
			'cache-control': 'public, immutable, no-transform, max-age=31536000',
			'content-type': 'image/svg+xml',
		},
	})
}
