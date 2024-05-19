import fetchPosts from '$lib/assets/fetchPosts'
import { postsPerPage } from '$lib/config'
import { type RequestHandler, json } from '@sveltejs/kit'

export const prerender = true

export const GET: RequestHandler = async ({ params }) => {
	const page = Number.parseInt(params.page ?? '1')

	const options = {
		offset: (page - 1) * postsPerPage,
		limit: postsPerPage,
	}

	const { posts } = await fetchPosts(options)

	return json(posts)
}
