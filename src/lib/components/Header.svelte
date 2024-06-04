<script lang="ts">
  import Nav from "./Nav.svelte";
  import { siteTitle } from "$lib/config";

  const focusMain = () => {
    const main = document.querySelector("main");
    main?.focus();
  };
</script>

<header class="navbar">
  <div class="navbar-start">
    <a on:click|preventDefault={focusMain} href="#main" class="sr-only">
      Skip to main content
    </a>
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost md:hidden">HB</div>
      <Nav
        cl="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
      />
    </div>
    <a href="/" class="btn btn-ghost text-xl">{siteTitle}</a>
  </div>
  <div class="navbar-center hidden md:flex">
    <Nav cl="menu menu-horizontal px-1" />
  </div>
  <div class="navbar-end"></div>
</header>
