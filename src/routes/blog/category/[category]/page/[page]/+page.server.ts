import { fetchPosts } from '$lib/posts'
import { postsPerPage } from '$lib/config'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const page = Number.parseInt(params.page ?? '1')
	if (page < 1) {
		error(404, `Invalid page number: ${page}`)
	}
	const category = params.category
	const { posts, total } = await fetchPosts({ offset: (page - 1) * postsPerPage, category })

	if (page > Math.ceil(total / postsPerPage)) {
		error(404, `Invalid page number: ${page}`)
	}

	return {
		posts,
		category,
		total,
		page,
	}
}
