import fetchPosts from '$lib/assets/fetchPosts'
import { postsPerPage } from '$lib/config'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const prerender = true

export const GET: RequestHandler = async ({ params }) => {
	const page = Number.parseInt(params.page ?? '1')

	const { posts } = await fetchPosts({
		offset: (page - 1) * postsPerPage,
		limit: postsPerPage,
	})

	return json(posts)
}
