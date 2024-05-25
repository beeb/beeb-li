<script lang="ts">
  import { postsPerPage } from '$lib/config'

  export let currentPage = 1
  export let totalPosts = 0
  export let path = '/blog/page'

  $: pagesAvailable = Math.ceil(totalPosts / postsPerPage)

  const isCurrentPage = (page: number) => page === currentPage
</script>

{#key currentPage}
  {#if pagesAvailable > 1}
    <nav aria-label="Pagination navigation">
      <ul>
        {#each Array.from({ length: pagesAvailable }, (_, i) => i + 1) as page}
          <li>
            <a href="{path}/{page}" aria-current={isCurrentPage(page)}>
              <span class="sr-only">
                {#if isCurrentPage(page)}
                  Current page:
                {:else}
                  Go to page
                {/if}
              </span>
              {page}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
{/key}
