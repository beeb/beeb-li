import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	redirect(301, `/blog/category/${params.category}/page/1`)
}
