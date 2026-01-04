declare module 'asciinema-player' {
	export interface PlayerOptions {
		cols?: number
		rows?: number
		autoPlay?: boolean
		preload?: boolean
		loop?: boolean | number
		startAt?: number | string
		speed?: number
		idleTimeLimit?: number
		theme?: string
		poster?: string
		audioUrl?: string
		fit?: 'width' | 'height' | 'both' | false | 'none'
		controls?: boolean | 'auto'
		markers?: Array<[number, string?] | number>
		pauseOnMarkers?: boolean
		terminalFontSize?: string
		terminalFontFamily?: string
		terminalLineHeight?: number
		logger?: Console | Logger
	}

	export interface Logger {
		debug(...args: unknown[]): void
		info(...args: unknown[]): void
		warn(...args: unknown[]): void
		error(...args: unknown[]): void
	}

	export interface MarkerEvent {
		index: number
		time: number
		label?: string
	}

	export interface InputEvent {
		data: string
	}

	export type PlayerEventMap = {
		play: Event
		playing: Event
		pause: Event
		ended: Event
		input: InputEvent
		marker: MarkerEvent
	}

	export interface Player {
		el: HTMLElement
		dispose: () => void
		getCurrentTime: () => Promise<number>
		getDuration: () => Promise<number | null>
		play: () => Promise<void>
		pause: () => Promise<void>
		seek: (location: number | string) => Promise<void>
		addEventListener<K extends keyof PlayerEventMap>(eventName: K, handler: (event: PlayerEventMap[K]) => void): void
	}

	export function create(src: string | object, element: HTMLElement, options?: PlayerOptions): Player
}
