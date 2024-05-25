import fetchPosts from '$lib/assets/fetchPosts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const { posts, total } = await fetchPosts()

	return {
		posts,
		total,
	}
}
