import fetchPosts from '$lib/fetchPosts'
import { siteDescription, siteTitle } from '$lib/config'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = true

export const GET: RequestHandler = async ({ url }) => {
	const { posts } = await fetchPosts({ limit: -1 })

	const body = render(url.origin, posts)
	const headers = {
		'Cache-Control': `max-age=0, s-max-age=${600}`,
		'Content-Type': 'application/xml',
	}
	return new Response(body, {
		status: 200,
		headers,
	})
}

const render = (baseUrl: string, posts: PostData[]) => `<?xml version="1.0" encoding="utf-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${siteTitle}</title>
<link>${baseUrl}</link>
<description>${siteDescription}</description>
<atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${posts
	.map(
		(post) => `<item>
<title>${post.title}</title>
<link>${baseUrl}/blog/${post.slug}</link>
<description>${post.excerpt}</description>
<guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
</item>`,
	)
	.join('')}
</channel>
</rss>
`
