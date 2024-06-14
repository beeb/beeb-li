import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { fetchPosts } from '$lib/posts'

export const entries = async () => {
	const { posts } = await fetchPosts({ limit: -1 })
	return posts.map((p) => ({ post: p.slug }))
}

export const load: PageLoad = async ({ params }) => {
	try {
		const post: Post = await import(`../../../lib/posts/${params.post}.md`)

		const enhancedImage = post.metadata.coverImage
			? (await import(`../../../lib/posts/${params.post}/title.jpg?enhanced&w=2048;1280;1024;768;512;256`)).default
			: null

		return {
			PostContent: post.default,
			meta: { ...post.metadata, slug: params.post, enhancedImage },
		}
	} catch (err) {
		console.error(err)
		error(404, 'post not found')
	}
}
