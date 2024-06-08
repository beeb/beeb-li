<script lang="ts">
  import { siteTitle } from "$lib/config.js";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>{siteTitle} - Blog Categories</title>
</svelte:head>

<div>
  <h1>All blog categories</h1>

  <ul>
    {#each data.categories as [category, count]}
      <li>
        <a href="/blog/category/{category}/page">
          {category}
        </a>
        ({count})
      </li>
    {/each}
  </ul>
</div>
