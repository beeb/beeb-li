import { postsPerPage } from '$lib/config'

const fetchPosts = async ({ offset = 0, limit = postsPerPage, category = '' } = {}) => {
	const posts = await Promise.all(
		Object.entries(import.meta.glob<Post>('/src/lib/posts/*.md')).map(async ([path, resolver]) => {
			const { metadata } = await resolver()
			const slug = path.split('/').pop()?.slice(0, -3) ?? 'undefined'
			return { ...metadata, slug }
		}),
	)

	const total = posts.length

	let sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

	if (category) {
		sortedPosts = sortedPosts.filter((post) => post.categories.includes(category))
	}

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

export default fetchPosts
