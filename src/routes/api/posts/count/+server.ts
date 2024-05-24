import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const prerender = true

export const GET: RequestHandler = () => {
	const posts = import.meta.glob('$lib/posts/*.md')

	return json(Object.keys(posts).length)
}
