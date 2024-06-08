import type { LayoutLoad } from './$types'

// Ensures all pages under this layout (which is all of them) are statically prerendered at build time
export const prerender = true

// No client side routing
export const csr = false

export const load: LayoutLoad = async ({ url }) => {
	return {
		baseUrl: url.origin,
	}
}
