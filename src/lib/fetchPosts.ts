import { postsPerPage } from '$lib/config'

export const fetchPosts = async ({ offset = 0, limit = postsPerPage, category = '' } = {}) => {
	const posts = await Promise.all(
		Object.entries(import.meta.glob<Post>('/src/lib/posts/*.md')).map(async ([path, resolver]) => {
			const { metadata } = await resolver()
			const slug = path.split('/').pop()?.slice(0, -3) ?? 'undefined'
			const enhancedImage = metadata.coverImage
				? (await import(`./posts/${slug}/title.jpg?enhanced&w=2048;1280;1024;768;512;256`)).default
				: null
			return { ...metadata, slug, enhancedImage }
		}),
	)

	let sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

	if (category) {
		sortedPosts = sortedPosts.filter((post) => post.categories.includes(category))
	}

	const total = sortedPosts.length

	if (offset) {
		sortedPosts = sortedPosts.slice(offset)
	}

	if (limit && limit < sortedPosts.length && limit !== -1) {
		sortedPosts = sortedPosts.slice(0, limit)
	}

	return {
		posts: sortedPosts,
		total,
	}
}

export const fetchCategories = async (opts: { sort?: boolean } = {}) => {
	const { posts } = await fetchPosts({ limit: -1 })

	// get unique categories, sorted by name and including the count of articles in each
	// `Map` preserves insertion sort order

	let categories = posts.flatMap((post) => post.categories)

	if (opts.sort === true) {
		categories = categories.toSorted((a, b) => a.localeCompare(b))
	}

	const uniqueCategories = categories.reduce(
		(acc, category) => acc.set(category, (acc.get(category) ?? 0) + 1),
		new Map<string, number>(),
	)

	return uniqueCategories
}
