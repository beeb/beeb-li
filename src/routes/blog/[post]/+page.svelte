<!-- This file renders each individual blog post for reading. Be sure to update the svelte:head below -->
<script lang="ts">
  import { siteTitle } from '$lib/config'
  import type { PageData } from './$types'

  export let data: PageData

  const { title, excerpt, date, updated, coverImage, categories } = data.meta
  const { PostContent } = data
</script>

<svelte:head>
  <title>{siteTitle} - {title}</title>
  <meta data-key="description" name="description" content={excerpt} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta name="twitter:title" content={title} />
  <meta property="og:description" content={excerpt} />
  <meta name="twitter:description" content={excerpt} />
  <!-- TODO: generate automatically? -->
  <!-- <meta property="og:image" content="https://yourdomain.com/image_path" /> -->
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <!-- <meta name="twitter:image" content="https://yourdomain.com/image_path" /> -->
</svelte:head>

<article>
  {#if coverImage}
    <img src={coverImage} alt="" />
  {/if}

  <div class="prose">
    <h1 class="">{title}</h1>
  </div>

  <div>
    <b>Published:</b>
    {new Date(date).toLocaleDateString()}
    {#if updated}
      <br />
      <b>Updated:</b>
      {new Date(updated).toLocaleDateString()}
    {/if}
  </div>

  <div class="prose">
    <svelte:component this={PostContent} />
  </div>

  {#if categories}
    <aside>
      <h2>Posted in:</h2>
      <ul>
        {#each categories as category}
          <li>
            <a href="/blog/category/{category}/">
              {category}
            </a>
          </li>
        {/each}
      </ul>
    </aside>
  {/if}
</article>
