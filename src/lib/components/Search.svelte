<script lang="ts">
  import { tick } from 'svelte'
  import { onNavigate } from '$app/navigation'
  import SearchIcon from 'virtual:icons/mingcute/search-3-fill'

  let pagefind: PagefindWrapper | undefined = undefined

  const fetchSearchResults = async (val: string) => {
    if (!pagefind) {
      return []
    }
    const search = await pagefind.debouncedSearch(val)
    if (search.results.length > 0) {
      const results = search.results
      const data = await Promise.all(results.map(async (r) => await r.data()))
      return data
    }
    return []
  }

  let showField = $state(false)
  let searchValue = $state('')
  let searchResults = $derived(fetchSearchResults(searchValue))
  let searchInput: HTMLInputElement

  $effect(() => {
    onNavigate(() => {
      searchValue = ''
      showField = false
    })
    ;(async () => {
      pagefind = (await import(/* @vite-ignore */ `${origin}/pagefind/pagefind.js`)) as PagefindWrapper
      pagefind.init()
    })()
  })
</script>

<div class="search-wrapper">
  <div class="md:hidden">
    <button
      type="button"
      class="btn btn-ghost"
      aria-label="Toggle search"
      aria-expanded={showField}
      aria-controls="search-field"
      onclick={async () => {
        if (showField) {
          searchValue = ''
          showField = false
        } else {
          showField = true
          await tick()
          searchInput?.focus()
        }
      }}
    >
      <SearchIcon aria-hidden="true" />
    </button>
  </div>
  <div class="absolute top-12 right-0 md:static md:top-0">
    <div
      id="search-field"
      class="dropdown dropdown-open dropdown-end md:block"
      class:hidden={!showField && searchValue === ''}
    >
      <label class="input input-bordered w-40 md:w-36 lg:w-40">
        <SearchIcon aria-hidden="true" />
        <input
          type="search"
          placeholder="Search"
          bind:value={searchValue}
          bind:this={searchInput}
          aria-label="Search"
          aria-controls="search-results"
          aria-autocomplete="list"
        />
      </label>
      {#if searchValue}
        <div
          id="search-results"
          class="dropdown-content bg-base-100 rounded-box p-4 mt-2 z-1 w-100 md:w-120 lg:w-160 max-w-[90vw] shadow-md"
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          {#await searchResults}
            <div aria-label="Loading search results">Loading...</div>
          {:then results}
            {#if results.length === 0}
              <div>No results</div>
            {:else}
              <div class="sr-only" aria-live="polite">
                {results.length} results found
              </div>
              {#each results as result, i (result.url)}
                <a href={result.url.replace('.html', '')} class="block">
                  <div class="flex flex-col gap-1">
                    <h3>{result.meta.title}</h3>
                    <div class="text-xs wrap-break-word">{@html result.excerpt}</div>
                  </div>
                </a>
                {#if i < results.length - 1}
                  <div class="divider my-2" aria-hidden="true"></div>
                {/if}
              {/each}
            {/if}
          {/await}
        </div>
      {/if}
    </div>
  </div>
</div>

<noscript>
  <!-- hide search component if JS is not enabled -->
  <style>
    .search-wrapper {
      display: none;
    }
  </style>
</noscript>
