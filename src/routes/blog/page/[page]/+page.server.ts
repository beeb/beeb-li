import fetchPosts from '$lib/fetchPosts'
import { postsPerPage } from '$lib/config'
import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const page = Number.parseInt(params.page ?? '1')
	if (page < 1) {
		error(404, `Invalid page number: ${page}`)
	}

	// Keeps from duplicating the blog index route as page 1
	if (page === 1) {
		redirect(301, '/blog')
	}

	const { posts, total } = await fetchPosts({ offset: (page - 1) * postsPerPage })

	return {
		posts,
		page,
		total,
	}
}
