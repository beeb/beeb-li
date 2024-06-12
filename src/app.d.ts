import 'unplugin-icons/types/svelte'

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '*.jpg?arraybuffer' {
	const content: ArrayBuffer
	export default content
}

export {}
