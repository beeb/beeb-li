<!-- This file handles any /blog/page/x route for pagination -->
<script lang="ts">
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import { postsPerPage, siteDescription, siteTitle } from '$lib/config'
  import type { PageData } from './$types'

  export let data: PageData
  const { page, total, posts } = data

  $: lowerBound = (page - 1) * postsPerPage + 1
  $: upperBound = Math.min(page * postsPerPage, total)
</script>

<svelte:head>
  <title>{siteTitle} - Blog - Page {page}</title>
  <meta data-key="description" name="description" content={siteDescription} />
</svelte:head>

{#if posts.length}
  <h1>Blog</h1>
  <small>Posts {lowerBound}-{upperBound} of {total}</small>
  <Pagination currentPage={page} totalPosts={total} />
  <PostsList {posts} />
  <Pagination currentPage={page} totalPosts={total} />
{:else}
  <p><strong>Oops!</strong> Sorry, no posts to show.</p>

  <p><a href="/blog">Back to blog</a></p>
{/if}
