import { fetchCategories } from '$lib/fetchPosts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	// get unique categories, sorted by name and including the count of articles in each
	// `Map` preserves insertion sort order
	const categories = await fetchCategories({ sort: true })

	return {
		categories,
	}
}
