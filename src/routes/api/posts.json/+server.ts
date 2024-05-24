import fetchPosts from '$lib/assets/fetchPosts'
import { postsPerPage } from '$lib/config'
import { type RequestHandler, json } from '@sveltejs/kit'

export const prerender = true

export const GET: RequestHandler = async () => {
	const { posts } = await fetchPosts()
	return json(posts)
}
