<script lang="ts">
  const ellipsis_threshold = 3;

  export let path = "/blog/page";
  export let loading = false;
  export let total: number;
  export let currentPage: number;
  export let perPage: number;
  export let limit = 7;

  let numberOfLinks: number = limit;
  let showFirstDots = false;
  let showLastDots = false;
  let startNumber = 1;

  $: lastPage = Math.ceil(total / perPage);
  $: {
    numberOfLinks = limit;
    showFirstDots = false;
    showLastDots = false;
    startNumber = 1;
    if (lastPage <= limit) {
      numberOfLinks = lastPage;
    } else if (currentPage < limit - 1 && limit > ellipsis_threshold) {
      showLastDots = true;
      numberOfLinks = limit - 1;
    } else if (
      lastPage - currentPage + 2 < limit &&
      limit > ellipsis_threshold
    ) {
      showFirstDots = true;
      numberOfLinks = limit - 1;
      startNumber = lastPage - numberOfLinks + 1;
    } else {
      if (limit > ellipsis_threshold) {
        numberOfLinks = limit - 2;
        showFirstDots = true;
        showLastDots = true;
      }
      startNumber = currentPage - Math.floor(numberOfLinks / 2);
    }
    if (startNumber < 1) {
      startNumber = 1;
      showFirstDots = false;
    } else if (startNumber > lastPage - numberOfLinks) {
      startNumber = lastPage - numberOfLinks + 1;
      showLastDots = false;
    }
    numberOfLinks = Math.min(numberOfLinks, lastPage - startNumber + 1);
  }
  $: range = Array.from({ length: numberOfLinks }, (_, i) => i + startNumber);
</script>

{#key currentPage}
  {#if lastPage > 1}
    <div class="my-8 flex flex-wrap items-center justify-center">
      <div class="join">
        <a
          class="btn-outline join-item btn"
          class:btn-disabled={currentPage === 1 || loading}
          href="{path}/1"
          aria-label="Go to first page"
        >
          «
        </a>
        <a
          class="btn-outline join-item btn"
          class:btn-disabled={currentPage === 1 || loading}
          href="{path}/{Math.max(currentPage - 1, 1)}"
          aria-label="Go to previous page"
          rel={currentPage !== 1 ? "prev" : undefined}
        >
          ‹
        </a>
        {#if showFirstDots}
          <btn class="btn-disabled btn-outline join-item btn">...</btn>
        {/if}
        {#each range as page}
          <a
            class="btn-outline join-item btn"
            class:btn-disabled={loading}
            class:btn-outline={page !== currentPage}
            class:btn-primary={page === currentPage}
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
          <btn class="btn-disabled btn-outline join-item btn">...</btn>
        {/if}
        <a
          class="btn-outline join-item btn"
          class:btn-disabled={currentPage === lastPage || loading}
          href="{path}/{Math.min(currentPage + 1, lastPage)}"
          aria-label="Go to next page"
          rel={currentPage !== lastPage ? "next" : undefined}
        >
          ›
        </a>
        <a
          class="btn-outline join-item btn"
          class:btn-disabled={currentPage === lastPage || loading}
          href="{path}/{lastPage}"
          aria-label="Go to last page"
        >
          »
        </a>
      </div>
    </div>
  {/if}
{/key}
