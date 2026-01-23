<script lang="ts">
  import { onNavigate } from '$app/navigation'

  let pagefind = undefined

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

  $effect(() => {
    onNavigate(() => {
      searchValue = ''
    })
    ;(async () => {
      pagefind = await import(/* @vite-ignore */ `${origin}/pagefind/pagefind.js`)
      pagefind.init()
    })()
  })
</script>

<div class="dropdown dropdown-open dropdown-end">
  <input type="text" placeholder="Search" bind:value={searchValue} class="input input-bordered w-24 lg:w-40" />
  {#if searchValue}
    <div class="dropdown-content bg-base-100 rounded-box p-4 mt-2 z-1 w-100 m-w-full shadow-md">
      {#await searchResults}
        <div>loading...</div>
      {:then results}
        {#each results as result, i (result.url)}
          <a href={result.url.replace('.html', '')} class="block">
            <div class="flex flex-col gap-1">
              <h3>{result.meta.title}</h3>
              <div class="text-xs">{@html result.excerpt}</div>
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
