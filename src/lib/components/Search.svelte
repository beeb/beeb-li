<script lang="ts">
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
      onclick={() => {
        if (showField) {
          searchValue = ''
        }
        showField = !showField
      }}
    >
      <SearchIcon />
    </button>
  </div>
  <div class="absolute top-12 right-0 md:static md:top-0">
    <div class="dropdown dropdown-open dropdown-end md:block" class:hidden={!showField && searchValue === ''}>
      <label class="input input-bordered w-40 md:w-36 lg:w-40">
        <SearchIcon />
        <input type="search" placeholder="Search" bind:value={searchValue} />
      </label>
      {#if searchValue}
        <div
          class="dropdown-content bg-base-100 rounded-box p-4 mt-2 z-1 w-100 md:w-120 lg:w-160 max-w-[90vw] shadow-md"
        >
          {#await searchResults}
            <div>loading...</div>
          {:then results}
            {#each results as result, i (result.url)}
              <a href={result.url.replace('.html', '')} class="block">
                <div class="flex flex-col gap-1">
                  <h3>{result.meta.title}</h3>
                  <div class="text-xs wrap-break-word">{@html result.excerpt}</div>
                </div>
              </a>
              {#if i < results.length - 1}
                <div class="divider"></div>
              {/if}
            {/each}
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
