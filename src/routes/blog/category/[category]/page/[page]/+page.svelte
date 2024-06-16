<script lang="ts">
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import { postsPerPage, siteTitle, siteDescription } from '$lib/config'
  import type { PageData } from './$types'

  export let data: PageData

  $: ({ posts, category, total, page } = data)

  $: lowerBound = (page - 1) * postsPerPage + 1
  $: upperBound = Math.min(page * postsPerPage, total)
</script>

<svelte:head>
  <title>{siteTitle} - Blog Category "{category}" - Page {page}</title>
  <meta property="og:title" content="{siteTitle} - Blog" />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:image" content="{data.baseUrl}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:title" content="{siteTitle} - Blog" />
  <meta name="twitter:description" content={siteDescription} />
  <meta property="twitter:image" content="{data.baseUrl}/og.png" />
</svelte:head>

{#if posts.length}
  <div class="prose sm:prose-lg mb-8">
    <h1 class="mb-1">Blog category: {category}</h1>
    <small>Posts {lowerBound}-{upperBound} of {total}</small>
  </div>
  <Pagination currentPage={page} {total} perPage={postsPerPage} path="/blog/category/{category}/page" />
  <PostsList {posts} />
  <Pagination currentPage={page} {total} perPage={postsPerPage} path="/blog/category/{category}/page" />
{:else}
  <p>
    <strong>Oops!</strong> Sorry, couldn't find any posts in the category "{category}".
  </p>

  <p><a href="/blog">Back to blog</a></p>
{/if}
