<script lang="ts">
  import PostsList from "$lib/components/PostsList.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { siteDescription, postsPerPage, siteTitle } from "$lib/config";
  import type { PageData } from "./$types";

  export let data: PageData;

  const { posts, category, total, page } = data;

  $: lowerBound = (page - 1) * postsPerPage + 1;
  $: upperBound = Math.min(page * postsPerPage, total);
</script>

<svelte:head>
  <title>{siteTitle} - Blog Category "{category}"" - Page {page}</title>
  <meta data-key="description" name={siteDescription} />
</svelte:head>

{#if posts.length}
  <div class="prose mb-8">
    <h1 class="mb-1">Blog category: {category}</h1>
    <small>Posts {lowerBound}-{upperBound} of {total}</small>
  </div>
  <Pagination
    currentPage={page}
    {total}
    perPage={postsPerPage}
    path="/blog/category/{category}/page"
  />
  <PostsList {posts} />
  <Pagination
    currentPage={page}
    {total}
    perPage={postsPerPage}
    path="/blog/category/{category}/page"
  />
{:else}
  <p>
    <strong>Oops!</strong> Sorry, couldn't find any posts in the category "{category}".
  </p>

  <p><a href="/blog">Back to blog</a></p>
{/if}
