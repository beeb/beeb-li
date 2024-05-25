<!-- This is the global layout file; it "wraps" every page on the site. (Or more accurately: is the parent component to every page component on the site.) -->
<script lang="ts">
  import '../app.css'
  import Header from '$lib/components/Header.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import { currentPage, isMenuOpen } from '../lib/assets/store'
  import { siteTitle } from '$lib/config'
  import { fade } from 'svelte/transition'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  const transitionIn = { delay: 150, duration: 150 }
  const transitionOut = { duration: 100 }

  /**
   * Updates the global store with the current path. (Used for highlighting
   * the current page in the nav, but could be useful for other purposes.)
   **/
  $: currentPage.set(data.path)
</script>

<svelte:head>
  <link rel="alternate" type="application/rss+xml" title={siteTitle} href={`${data.baseUrl}/rss.xml`} />
</svelte:head>

<div class:open={$isMenuOpen}>
  <Header />
  {#key data.path}
    <main id="main" tabindex="-1" in:fade|global={transitionIn} out:fade|global={transitionOut}>
      <slot />
    </main>
  {/key}
  <Footer />
</div>
