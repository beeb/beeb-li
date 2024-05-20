import { siteDescription, siteTitle } from '$lib/config'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = true

interface PostData extends PostPrelude {
	slug: string
}

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.toString().replace('/api/rss.xml', '')
	const data = await Promise.all(
		Object.entries(import.meta.glob<Post>('$lib/posts/*.md')).map(async ([path, resolver]) => {
			const { metadata } = await resolver()
			const slug = path.split('/').pop()?.split('.').shift() ?? 'undefined'
			return { ...metadata, slug }
		}),
	).then((posts) => {
		return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	})

	const body = render(baseUrl, data)
	const headers = {
		'Cache-Control': `max-age=0, s-max-age=${600}`,
		'Content-Type': 'application/xml',
	}
	return new Response(body, {
		status: 200,
		headers,
	})
}

//Be sure to review and replace any applicable content below!
const render = (baseUrl: string, posts: PostData[]) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${siteTitle}</title>
<description>${siteDescription}</description>
<link>https://${baseUrl}</link>
<atom:link href="https://${baseUrl}/api/rss.xml" rel="self" type="application/rss+xml"/>
${posts
	.map(
		(post) => `<item>
<guid isPermaLink="true">https://${baseUrl}/blog/${post.slug}</guid>
<title>${post.title}</title>
<link>https://${baseUrl}/blog/${post.slug}</link>
<description>${post.excerpt}</description>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
</item>`,
	)
	.join('')}
</channel>
</rss>
`
