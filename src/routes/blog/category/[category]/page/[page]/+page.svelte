<script lang="ts">
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import { postsPerPage, siteTitle, siteDescription } from '$lib/config'

  const { data } = $props()

  const lowerBound = $derived((data.page - 1) * postsPerPage + 1)
  const upperBound = $derived(Math.min(data.page * postsPerPage, data.total))
</script>

<svelte:head>
  <title>{siteTitle} - Blog Category "{data.category}" - Page {data.page}</title>
  <meta property="og:title" content="{siteTitle} - Blog" />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:image" content="{data.baseUrl}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:title" content="{siteTitle} - Blog" />
  <meta name="twitter:description" content={siteDescription} />
  <meta property="twitter:image" content="{data.baseUrl}/og.png" />
</svelte:head>

{#if data.posts.length}
  <div class="prose sm:prose-lg mb-8">
    <h1 class="mb-1">Blog category: {data.category}</h1>
    <small>Posts {lowerBound}-{upperBound} of {data.total}</small>
  </div>
  <Pagination
    currentPage={data.page}
    total={data.total}
    perPage={postsPerPage}
    path="/blog/category/{data.category}/page"
  />
  <PostsList posts={data.posts} />
  <Pagination
    currentPage={data.page}
    total={data.total}
    perPage={postsPerPage}
    path="/blog/category/{data.category}/page"
  />
{:else}
  <p>
    <strong>Oops!</strong> Sorry, couldn't find any posts in the category "{data.category}".
  </p>

  <p><a href="/blog">Back to blog</a></p>
{/if}
