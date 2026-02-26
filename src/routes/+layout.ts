import type { LayoutLoad } from './$types'

// Ensures all pages under this layout (which is all of them) are statically prerendered at build time
export const prerender = true
export const trailingSlash = 'always'

export const csr = true

export const load: LayoutLoad = async ({ url }) => {
	return {
		baseUrl: url.origin,
	}
}
