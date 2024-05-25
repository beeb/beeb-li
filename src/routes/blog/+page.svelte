<script lang="ts">
  import PostsList from '$lib/components/PostsList.svelte'
  import Pagination from '$lib/components/Pagination.svelte'
  import { siteDescription, siteTitle } from '$lib/config'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<svelte:head>
  <title>{siteTitle} - Blog</title>
  <meta data-key="description" name="description" content={siteDescription} />
</svelte:head>

<h1>Blog</h1>

<PostsList posts={data.posts} />

<Pagination currentPage={1} totalPosts={data.total} />
