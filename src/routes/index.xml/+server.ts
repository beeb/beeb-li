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

const render = (baseUrl: string, posts: PostData[]) => `<?xml version="1.0" encoding="UTF-8" ?>
<feed xmlns:atom="http://www.w3.org/2005/Atom">
<title>${siteTitle}</title>
<subtitle>${siteDescription}</subtitle>
<link>${baseUrl}</link>
<link href="${baseUrl}/index.xml" rel="self" type="application/atom+xml"/>
<id>${baseUrl}</id>
<updated>${new Date().toISOString()}</updated>
<author>
<name>Valentin Bersier</name>
<uri>${baseUrl}</uri>
</author>
${posts
	.map(
		(post) => `<entry>
<id>${baseUrl}/blog/${post.slug}</id>
<title>${post.title}</title>
<link>${baseUrl}/blog/${post.slug}</link>
<summary type="html">${post.excerpt}</summary>
<updated>${post.updated ? new Date(post.updated).toISOString() : new Date(post.date).toISOString()}</updated>
${post.categories.map((category) => `<category term="${category}" />`).join('')}
</entry>`,
	)
	.join('')}
</feed>
`
