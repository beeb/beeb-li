<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements'
  import Nav from '$lib/components/Nav.svelte'
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte'
  import Logo from '$lib/components/Logo.svelte'
  import { siteTitle } from '$lib/config'
  import Hamburger from 'virtual:icons/mingcute/menu-fill'

  let pagefind = undefined

  const focusMain: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault()
    const main = document.querySelector('main')
    main?.focus()
  }

  $effect(() => {
    ;(async () => {
      pagefind = await import(/* @vite-ignore */ `${origin}/pagefind/pagefind.js`)
      pagefind.init()
    })()
  })

  async function fetchSearchResults(val: string) {
    const search = await pagefind?.debouncedSearch(val)
    if (search?.results?.length > 0) {
      const results = search.results
      const data = await Promise.all(results.map(async (r) => await r.data()))
      return data
    }
    return []
  }

  let searchValue = $state('')
  let searchResults = $derived(fetchSearchResults(searchValue))
</script>

<div class="text-center">
  <a onclick={focusMain} href="#main" class="link absolute left-[-1000%] top-[-1000%] focus:static">
    Skip to main content
  </a>
</div>
<header class="navbar mb-8 px-0 min-h-20">
  <div class="navbar-start grow w-auto">
    <div class="dropdown sm:hidden relative -left-4">
      <div tabindex="0" role="button" class="btn btn-ghost text-lg" aria-label="Open dropdown menu">
        <Hamburger />
      </div>
      <Nav tabindex="0" class="menu menu-lg dropdown-content mt-3 z-1 p-2 shadow-sm bg-base-200 rounded-box w-52" />
    </div>
    <a href="/" class="text-2xl sm:text-3xl text-primary font-extrabold inline-flex gap-2 items-center">
      <Logo class="w-8 sm:w-10 shrink-0" />
      {siteTitle}
    </a>
  </div>
  <div class="navbar-end gap-4 w-auto">
    <ThemeSwitcher />
    <input type="text" placeholder="Search" bind:value={searchValue} class="input input-bordered w-24 md:w-auto" />
    <Nav class="hidden sm:flex menu text-lg menu-horizontal p-0" />
  </div>
</header>

{#await searchResults}
  <div>loading...</div>
{:then results}
  {#each results as result (result.url)}
    <div class="flex flex-col gap-1">
      <a href={result.url.replace('.html', '')}>
        {result.meta.title}
      </a>
      <div class="text-xs">{@html result.excerpt}</div>
    </div>
  {/each}
{/await}
