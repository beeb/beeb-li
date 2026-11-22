<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements'
	import Nav from '#lib/components/Nav.svelte'
	import ThemeSwitcher from '#lib/components/ThemeSwitcher.svelte'
	import Logo from '#lib/components/Logo.svelte'
	import Search from '#lib/components/Search.svelte'
	import { siteTitle } from '#lib/config.js'
	import Hamburger from 'virtual:icons/mingcute/menu-fill'

	const focusMain: MouseEventHandler<HTMLAnchorElement> = (e) => {
		e.preventDefault()
		const main = document.querySelector('main')
		main?.focus()
	}
</script>

<div class="text-center">
	<a onclick={focusMain} href="#main" class="link absolute top-[-1000%] left-[-1000%] focus:static">
		Skip to main content
	</a>
</div>
<header class="navbar mb-8 min-h-20 px-0">
	<div class="navbar-start w-auto grow">
		<div class="dropdown relative -left-4 sm:hidden">
			<!-- biome-ignore lint/a11y/useSemanticElements: daisyUI dropdown pattern -->
			<div tabindex="0" role="button" class="btn btn-ghost text-lg" aria-label="Open dropdown menu">
				<Hamburger />
			</div>
			<!-- biome-ignore lint/a11y/noNoninteractiveTabindex: daisyUI dropdown pattern -->
			<Nav tabindex="0" class="menu menu-lg dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow-sm" />
		</div>
		<a href="/" class="text-primary inline-flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
			<Logo class="w-8 shrink-0 md:w-10" />
			{siteTitle}
		</a>
	</div>
	<div class="navbar-end relative left-4 w-auto sm:left-0 md:gap-2">
		<ThemeSwitcher />
		<Search />
		<Nav class="menu menu-horizontal hidden p-0 text-lg sm:flex" />
	</div>
</header>
