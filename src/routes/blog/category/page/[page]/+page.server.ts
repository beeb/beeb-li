import fetchPosts from '$lib/assets/fetchPosts'
import { postsPerPage } from '$lib/config'
import { redirect } from '@sveltejs/kit'

export const load = async ({ fetch, params }) => {
	const page = Number.parseInt(params.page ?? '1')

	// Keeps from duplicationg the blog index route as page 1
	if (page <= 1) {
		redirect(301, '/blog')
	}

	const offset = page * postsPerPage - postsPerPage

	const totalPostsRes = await fetch('/api/posts/count')
	const total = await totalPostsRes.json()
	const { posts } = await fetchPosts({ offset })

	return {
		posts,
		page,
		totalPosts: total,
	}
}
