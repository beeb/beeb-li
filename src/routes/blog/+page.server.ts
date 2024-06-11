import fetchPosts from '$lib/fetchPosts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const { posts, total } = await fetchPosts()

	return {
		posts,
		total,
	}
}
