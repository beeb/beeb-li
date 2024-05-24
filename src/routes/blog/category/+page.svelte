<script>
  export let data
  const { categories } = data
</script>

<svelte:head>
  <title>Blog | Categories</title>
</svelte:head>

<div>
  <h1>All blog categories</h1>

  <ul>
    {#each categories as [category, count]}
      <li>
        <a href="/blog/category/{category}">
          {category}
        </a>
        ({count})
      </li>
    {/each}
  </ul>
</div>
