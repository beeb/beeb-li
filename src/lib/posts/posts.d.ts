interface Post {
	metadata: PostPrelude
}

interface PostPrelude {
	title: string
	date: string
	updated: string
	categories: string[]
	coverImage?: string
	coverWidth?: number
	coverHeight?: number
	excerpt: string
}
