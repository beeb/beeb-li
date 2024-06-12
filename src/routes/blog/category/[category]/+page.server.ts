import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import fetchPosts from '$lib/fetchPosts'

export const entries = async () => {
	const { posts } = await fetchPosts({ limit: -1 })
	const categories = posts
		.flatMap((post) => post.categories)
		.reduce((acc, category) => acc.set(category, (acc.get(category) ?? 0) + 1), new Map<string, number>())
	return [...categories].map(([c, _]) => ({ category: c }))
}

export const load: PageServerLoad = async ({ params }) => {
	redirect(301, `/blog/category/${params.category}/page/1`)
}
