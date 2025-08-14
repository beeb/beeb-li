<script lang="ts">
import PostsList from '$lib/components/PostsList.svelte'
import Pagination from '$lib/components/Pagination.svelte'
import { postsPerPage, siteTitle, siteDescription } from '$lib/config'

const { data } = $props()

const lowerBound = $derived((data.page - 1) * postsPerPage + 1)
const upperBound = $derived(Math.min(data.page * postsPerPage, data.total))
</script>

<svelte:head>
  <title>{siteTitle} - Blog - Page {data.page}</title>
  <meta property="og:title" content="{siteTitle} - Blog" />
  <meta property="og:description" content={siteDescription} />
  <meta property="og:image" content="{data.baseUrl}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:title" content="{siteTitle} - Blog" />
  <meta name="twitter:description" content={siteDescription} />
  <meta property="twitter:image" content="{data.baseUrl}/og.png" />
</svelte:head>

{#if data.posts.length}
  <div class="flex justify-between items-center mb-12">
    <div class="prose sm:prose-lg">
      <h1 class="mb-1">Blog</h1>
      <small>Posts {lowerBound}-{upperBound} of {data.total}</small>
    </div>
    <a class="link text-lg" href="/blog/category">All blog categories</a>
  </div>
  <Pagination currentPage={data.page} total={data.total} perPage={postsPerPage} />
  <PostsList posts={data.posts} />
  <Pagination currentPage={data.page} total={data.total} perPage={postsPerPage} />
{:else}
  <div class="flex flex-col items-center gap-2 text-xl">
    <p><strong>Oops!</strong> Sorry, no posts to show.</p>
    <p><a class="link" href="/blog">Back to the blog</a></p>
  </div>
{/if}
