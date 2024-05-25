import fetchPosts from '$lib/assets/fetchPosts'
import { siteDescription, siteTitle } from '$lib/config'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = true

interface PostData extends PostPrelude {
	slug: string
}

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

//Be sure to review and replace any applicable content below!
const render = (baseUrl: string, posts: PostData[]) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${siteTitle}</title>
<description>${siteDescription}</description>
<link>${baseUrl}</link>
<atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${posts
	.map(
		(post) => `<item>
<guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
<title>${post.title}</title>
<link>${baseUrl}/blog/${post.slug}</link>
<description>${post.excerpt}</description>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
</item>`,
	)
	.join('')}
</channel>
</rss>
`
