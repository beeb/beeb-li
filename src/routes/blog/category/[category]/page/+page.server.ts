import { redirect } from '@sveltejs/kit'
import type { EntryGenerator, PageServerLoad } from './$types'
import { fetchCategories } from '$lib/posts'

// for page crawling
export const entries: EntryGenerator = async () => {
	const categories = await fetchCategories()
	return [...categories].map(([c, _]) => ({ category: c }))
}

export const load: PageServerLoad = async ({ params }) => {
	redirect(301, `/blog/category/${params.category}/page/1`)
}
