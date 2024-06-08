interface Post {
	default: ConstructorOfATypedSvelteComponent
	metadata: PostPrelude
}

interface PostPrelude {
	title: string
	date: string
	updated?: string
	categories: string[]
	coverImage?: bool
	coverAlt?: string
	excerpt: string
}

interface PostData extends PostPrelude {
	slug: string
	enhancedImage?: Picture
}
