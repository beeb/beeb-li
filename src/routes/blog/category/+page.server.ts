import fetchPosts from '$lib/assets/fetchPosts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const { posts } = await fetchPosts()

	const categories = posts
		.flatMap((post) => post.categories)
		.toSorted((a, b) => a.localeCompare(b))
		.reduce((acc, category) => acc.set(category, (acc.get(category) || 0) + 1), new Map())

	return {
		categories,
	}
}
