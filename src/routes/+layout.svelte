<script lang="ts">
import '../app.css'
import Header from '$lib/components/Header.svelte'
import Footer from '$lib/components/Footer.svelte'
import { siteDescription } from '$lib/config'

const { data, children } = $props()
</script>

<svelte:head>
  <link rel="alternate" type="application/atom+xml" title="Sitewide Atom Feed" href={`${data.baseUrl}/index.xml`} />
  <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={`${data.baseUrl}/rss.xml`} />
  <meta data-key="description" name="description" content={siteDescription} />
  <meta name="author" content="Valentin Bersier" />
</svelte:head>

<div class="px-6">
  <Header />
  <main id="main" tabindex="-1" class="max-w-(--breakpoint-lg) mx-auto">
    {@render children()}
  </main>
  <Footer />
</div>
