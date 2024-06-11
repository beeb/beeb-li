import fetchPosts from '$lib/fetchPosts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const { posts } = await fetchPosts()

	// get unique categories, sorted by name and including the count of articles in each
	// `Map` preserves insertion sort order
	const categories = posts
		.flatMap((post) => post.categories)
		.toSorted((a, b) => a.localeCompare(b))
		.reduce((acc, category) => acc.set(category, (acc.get(category) ?? 0) + 1), new Map<string, number>())

	return {
		categories,
	}
}
