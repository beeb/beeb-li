import fetchPosts from '$lib/assets/fetchPosts'
import { postsPerPage } from '$lib/config'
import { type RequestHandler, json } from '@sveltejs/kit'

export const prerender = true

export const GET: RequestHandler = async () => {
	const options = {
		limit: postsPerPage,
	}

	const { posts } = await fetchPosts(options)
	return json(posts)
}
