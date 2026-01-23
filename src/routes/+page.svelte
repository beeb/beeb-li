<script lang="ts">
  import { siteTitle, siteDescription } from '$lib/config'

  const { data } = $props()
  const ReadmeFile = await import('../../README.md')
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta property="og:title" content={siteTitle} />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:image" content="{data.baseUrl}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:title" content="{siteTitle} - Blog" />
  <meta name="twitter:description" content={siteDescription} />
  <meta property="twitter:image" content="{data.baseUrl}/og.png" />
</svelte:head>

<main data-pagefind-body>
  <div class="prose sm:prose-lg w-full max-w-full mb-4">
    <h1>Hi there!</h1>
  </div>
  <div class="prose prose-lg w-full max-w-full">
    <ReadmeFile.default />
  </div>
</main>
