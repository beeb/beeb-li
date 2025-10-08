import 'unplugin-icons/types/svelte'

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	namespace Intl {
		interface Locale {
			getWeekInfo: () => { firstDay: number, weekend: number[], minimalDays: number }
		}
	}
}

export {}
