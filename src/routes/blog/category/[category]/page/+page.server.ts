import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { fetchCategories } from '$lib/posts'

export const entries = async () => {
	const categories = await fetchCategories()
	return [...categories].map(([c, _]) => ({ category: c }))
}

export const load: PageServerLoad = async ({ params }) => {
	redirect(301, `/blog/category/${params.category}/page/1`)
}
