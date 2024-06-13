<script lang="ts">
  import { siteTitle } from "$lib/config.js";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>{siteTitle} - Blog Categories</title>
</svelte:head>

<div>
  <div class="prose sm:prose-lg mb-4">
    <h1>All blog categories</h1>
  </div>
  <div class="prose prose-lg">
    <ul>
      {#each data.categories as [category, count]}
        <li>
          <a href="/blog/category/{category}/page/1">
            {category}
          </a>
          ({count})
        </li>
      {/each}
    </ul>
  </div>
</div>
