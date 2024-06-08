<script lang="ts">
  import "../app.css";
  import "../prism.css";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { siteDescription } from "$lib/config";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;
</script>

<svelte:head>
  <link
    rel="alternate"
    type="application/atom+xml"
    title="Sitewide Atom Feed"
    href={`${data.baseUrl}/index.xml`}
  />
  <meta data-key="description" name="description" content={siteDescription} />
  <meta name="author" content="Valentin Bersier" />
</svelte:head>

<div class="max-w-screen-lg mx-auto px-6">
  <Header />
  <main id="main" tabindex="-1">
    <slot />
  </main>
  <Footer />
</div>
