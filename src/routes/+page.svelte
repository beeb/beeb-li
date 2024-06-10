<script lang="ts">
  import { siteTitle } from "$lib/config";

  export let data;
</script>

<svelte:head>
  <title>{siteTitle}</title>
</svelte:head>

<div class="prose sm:prose-lg w-full max-w-full mb-4">
  <h1>Hi there!</h1>
</div>
<div class="prose prose-lg w-full max-w-full">
  <svelte:component this={data.Readme} />
</div>
