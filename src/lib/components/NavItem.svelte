<script lang="ts">
  import { currentPage, isMenuOpen } from '$lib/assets/store'

  export let href: string

  $: isCurrentPage = $currentPage.startsWith(href)

  const maybeCloseMenu = () => {
    if (href !== $currentPage) {
      isMenuOpen.set(false)
    }
  }
</script>

<li>
  <a {href} on:click={maybeCloseMenu} aria-current={isCurrentPage ? 'page' : false}>
    <slot />
  </a>
</li>
