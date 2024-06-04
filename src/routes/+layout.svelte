<!-- This is the global layout file; it "wraps" every page on the site. (Or more accurately: is the parent component to every page component on the site.) -->
<script lang="ts">
  import "../app.css";
  import "../prism.css";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { siteTitle } from "$lib/config";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;
</script>

<svelte:head>
  <link
    rel="alternate"
    type="application/rss+xml"
    title={siteTitle}
    href={`${data.baseUrl}/rss.xml`}
  />
</svelte:head>

<div class="container mx-auto px-4">
  <Header />
  {#key data.path}
    <main id="main" tabindex="-1">
      <slot />
    </main>
  {/key}
  <Footer />
</div>
