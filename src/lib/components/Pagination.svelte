<script lang="ts">
  interface Props {
    path?: string
    loading?: boolean
    total: number
    currentPage: number
    perPage: number
    neighbors?: number
  }

  const { path = '/blog/page', loading = false, total, currentPage, perPage, neighbors = 3 }: Props = $props()

  const totalPages = $derived(Math.ceil(total / perPage))
  let startNumber = $derived(Math.max(currentPage - neighbors, 1))
  let endNumber = $derived(Math.min(currentPage + neighbors, totalPages))
  let showFirstDots = $derived(startNumber > 1)
  let showLastDots = $derived(endNumber < totalPages)
  const range = $derived(Array.from({ length: endNumber - startNumber + 1 }, (_, i) => i + startNumber))
</script>

{#if totalPages > 1 && currentPage <= totalPages && currentPage > 0}
  <div class="my-8 flex flex-wrap items-center justify-center">
    <div class="join">
      <a
        class="join-item btn"
        class:btn-disabled={currentPage === 1 || loading}
        href="{path}/1"
        aria-label="Go to first page"
      >
        «
      </a>
      <a
        class="join-item btn"
        class:btn-disabled={currentPage === 1 || loading}
        href="{path}/{Math.max(currentPage - 1, 1)}"
        aria-label="Go to previous page"
        rel={currentPage !== 1 ? 'prev' : undefined}
      >
        ‹
      </a>
      {#if showFirstDots}
        <btn class="join-item btn btn-disabled">...</btn>
      {/if}
      {#each range as page}
        <a
          class={[
            'join-item btn',
            {
              'btn-primary': page === currentPage,
              'btn-disabled': loading
            }
          ]}
          aria-current={page === currentPage}
          href="{path}/{page}"
        >
          <span class="sr-only">
            {#if page === currentPage}
              Current page:
            {:else}
              Go to page
            {/if}
          </span>
          {page}
        </a>
      {/each}
      {#if showLastDots}
        <btn class="join-item btn btn-disabled">...</btn>
      {/if}
      <a
        class="join-item btn"
        class:btn-disabled={currentPage === totalPages || loading}
        href="{path}/{Math.min(currentPage + 1, totalPages)}"
        aria-label="Go to next page"
        rel={currentPage !== totalPages ? 'next' : undefined}
      >
        ›
      </a>
      <a
        class="join-item btn"
        class:btn-disabled={currentPage === totalPages || loading}
        href="{path}/{totalPages}"
        aria-label="Go to last page"
      >
        »
      </a>
    </div>
  </div>
{/if}
