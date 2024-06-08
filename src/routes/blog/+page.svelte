<script lang="ts">
  import PostsList from "$lib/components/PostsList.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { siteDescription, siteTitle, postsPerPage } from "$lib/config";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>{siteTitle} - Blog</title>
  <meta data-key="description" name="description" content={siteDescription} />
</svelte:head>

<div class="flex justify-between items-center mb-12">
  <div class="prose">
    <h1>Blog</h1>
  </div>
  <a class="link text-lg" href="/blog/category">All blog categories</a>
</div>

<PostsList posts={data.posts} />

<Pagination currentPage={1} total={data.total} perPage={postsPerPage} />
