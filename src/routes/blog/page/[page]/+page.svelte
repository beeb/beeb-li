<script lang="ts">
  import PostsList from "$lib/components/PostsList.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { postsPerPage, siteTitle } from "$lib/config";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ page, total, posts } = data);

  $: lowerBound = (page - 1) * postsPerPage + 1;
  $: upperBound = Math.min(page * postsPerPage, total);
</script>

<svelte:head>
  <title>{siteTitle} - Blog - Page {page}</title>
</svelte:head>

{#if posts.length}
  <div class="flex justify-between items-center mb-12">
    <div class="prose prose-lg">
      <h1 class="mb-1">Blog</h1>
      <small>Posts {lowerBound}-{upperBound} of {total}</small>
    </div>
    <a class="link text-lg" href="/blog/category">All blog categories</a>
  </div>
  <Pagination currentPage={page} {total} perPage={postsPerPage} />
  <PostsList {posts} />
  <Pagination currentPage={page} {total} perPage={postsPerPage} />
{:else}
  <div class="flex flex-col items-center gap-2 text-xl">
    <p><strong>Oops!</strong> Sorry, no posts to show.</p>
    <p><a class="link" href="/blog">Back to the blog</a></p>
  </div>
{/if}
