<script lang="ts">
  import { isMenuOpen } from '$lib/assets/store'
  import HamburgerMenuButton from './HamburgerMenuButton.svelte'
  import NavItems from './NavItems.svelte'
</script>

<!-- Contents of this file will be used in the header and the responsive hamburger menu. -->
<nav class:open={$isMenuOpen}>
  <NavItems />
  <HamburgerMenuButton closeOnly={true} />
</nav>
