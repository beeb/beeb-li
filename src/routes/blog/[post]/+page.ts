import { error } from '@sveltejs/kit'

export const load = async ({ params }) => {
	try {
		const post = await import(`../../../lib/posts/${params.post}.md`)

		return {
			PostContent: post.default,
			meta: { ...post.metadata, slug: params.post },
		}
	} catch (err) {
		console.error(err)
		error(404, 'post not found')
	}
}
