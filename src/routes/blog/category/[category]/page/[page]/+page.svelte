<script lang="ts">
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import { siteDescription, postsPerPage } from '$lib/config'
  import type { PageData } from './$types'

  export let data: PageData

  const { posts, category, total, page } = data

  $: lowerBound = page * postsPerPage - (postsPerPage - 1) || 1
  $: upperBound = Math.min(page * postsPerPage, total)
</script>

<svelte:head>
  <title>Blog category {category} - page {page}</title>
  <meta data-key="description" name={siteDescription} />
</svelte:head>

{#if posts.length}
  <h1>Blog category: {category}</h1>
  <small>Posts {lowerBound}–{upperBound} of {total}</small>
  <Pagination currentPage={page} totalPosts={total} path="/blog/category/{category}/page" />
  <PostsList {posts} />
  <Pagination currentPage={page} totalPosts={total} path="/blog/category/{category}/page" />
{:else}
  <p><strong>Oops!</strong> Sorry, couldn't find any posts in the category "{category}".</p>

  <p><a href="/blog">Back to blog</a></p>
{/if}
