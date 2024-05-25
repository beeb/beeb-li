<script lang="ts">
  import MainNav from './MainNav.svelte'
  import HamburgerMenuButton from './HamburgerMenuButton.svelte'
  import { siteTitle } from '$lib/config'

  const focusMain = () => {
    const main = document.querySelector('main')
    main?.focus()
  }
</script>

<header>
  <a on:click|preventDefault={focusMain} href="#main">Skip to main content</a>

  <a href="/">
    {siteTitle}
  </a>

  <HamburgerMenuButton />
  <MainNav />
</header>
