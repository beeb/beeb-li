import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
	try {
		const post: Post = await import(`../../../lib/posts/${params.post}.md`)

		const enhancedImage = post.metadata.coverImage
			? (await import(`../../../lib/posts/${params.post}/title.jpg?enhanced`)).default
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
