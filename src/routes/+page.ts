import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
	const ReadmeFile = await import('../../README.md')
	return {
		Readme: ReadmeFile.default,
	}
}
