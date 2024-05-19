export const load = async ({ url, fetch }) => {
	const res = await fetch(`${url.origin}/api/posts.json`)
	const posts = await res.json()

	const uniqueCategories = {}

	for (const post of posts) {
		for (const category of post.categories) {
			if (Object.hasOwn(uniqueCategories, category)) {
				uniqueCategories[category].count += 1
			} else {
				uniqueCategories[category] = {
					title: category,
					count: 1,
				}
			}
		}
	}

	const sortedUniqueCategories = Object.values(uniqueCategories).sort((a, b) => a.title > b.title)

	return {
		uniqueCategories: sortedUniqueCategories,
	}
}
