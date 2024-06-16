<script lang="ts">
  import Nav from '$lib/components/Nav.svelte'
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte'
  import Logo from '$lib/components/Logo.svelte'
  import { siteTitle } from '$lib/config'
  import Hamburger from 'virtual:icons/mingcute/menu-fill'

  const focusMain = () => {
    const main = document.querySelector('main')
    main?.focus()
  }
</script>

<div class="text-center">
  <a on:click|preventDefault={focusMain} href="#main" class="link absolute left-[-1000%] top-[-1000%] focus:static">
    Skip to main content
  </a>
</div>
<header class="navbar mb-8 px-0 min-h-20">
  <div class="navbar-start grow w-auto">
    <div class="dropdown sm:hidden relative -left-4">
      <div tabindex="0" role="button" class="btn btn-ghost text-lg">
        <Hamburger />
      </div>
      <Nav tabindex="0" class="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52" />
    </div>
    <a href="/" class="text-2xl sm:text-3xl text-primary font-extrabold inline-flex gap-2 items-center">
      <Logo class="w-8 sm:w-10 shrink-0" />
      {siteTitle}
    </a>
  </div>
  <div class="navbar-end gap-4 w-auto">
    <ThemeSwitcher />
    <Nav class="hidden sm:flex menu text-lg menu-horizontal p-0" />
  </div>
</header>
