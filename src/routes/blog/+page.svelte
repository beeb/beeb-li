<script lang="ts">
  import PostsList from "$lib/components/PostsList.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { siteTitle, siteDescription, postsPerPage } from "$lib/config";

  const { data } = $props();
</script>

<svelte:head>
  <title>{siteTitle} - Blog</title>
  <meta property="og:title" content="{siteTitle} - Blog" />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:image" content="{data.baseUrl}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:title" content="{siteTitle} - Blog" />
  <meta name="twitter:description" content={siteDescription} />
  <meta property="twitter:image" content="{data.baseUrl}/og.png" />
</svelte:head>

<div class="flex justify-between items-center mb-12">
  <div class="prose sm:prose-lg">
    <h1>Blog</h1>
  </div>
  <a class="link text-lg" href="/blog/category">All blog categories</a>
</div>

<PostsList posts={data.posts} />

<Pagination currentPage={1} total={data.total} perPage={postsPerPage} />
