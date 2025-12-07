<script lang="ts">
  import { fetchCategories } from '$lib/posts'
  import { siteTitle, siteDescription } from '$lib/config.js'

  const { data } = $props()
  const categories = await fetchCategories({ sort: true })
</script>

<svelte:head>
  <title>{siteTitle} - Blog Categories</title>
  <meta property="og:title" content="{siteTitle} - Blog" />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:image" content="{data.baseUrl}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:title" content="{siteTitle} - Blog" />
  <meta name="twitter:description" content={siteDescription} />
  <meta property="twitter:image" content="{data.baseUrl}/og.png" />
</svelte:head>

<div>
  <div class="prose sm:prose-lg mb-4">
    <h1>All blog categories</h1>
  </div>
  <div class="prose prose-lg">
    <ul>
      {#each categories as [category, count]}
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
