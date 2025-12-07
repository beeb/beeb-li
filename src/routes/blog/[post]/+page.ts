import { error } from '@sveltejs/kit'
import type { EntryGenerator, PageLoad } from './$types'
import { fetchCover, fetchPosts } from '$lib/posts'

// for page crawling
export const entries: EntryGenerator = async () => {
	const { posts } = await fetchPosts({ limit: -1 })
	return posts.map((p) => ({ post: p.slug }))
}

export const load: PageLoad = async ({ params }) => {
	try {
		const post: Post = await import(`../../../lib/posts/${params.post}.md`)

		const enhancedImage = post.metadata.coverImage ? await fetchCover(params.post) : null

		return {
			PostContent: post.default,
			meta: { ...post.metadata, slug: params.post, enhancedImage },
		}
	} catch (err) {
		console.error(err)
		error(404, 'post not found')
	}
}
