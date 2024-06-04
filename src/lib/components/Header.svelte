<script lang="ts">
  import Nav from "./Nav.svelte";
  import { siteTitle } from "$lib/config";

  const focusMain = () => {
    const main = document.querySelector("main");
    main?.focus();
  };
</script>

<div class="text-center">
  <a
    on:click|preventDefault={focusMain}
    href="#main"
    class="link absolute left-[-1000%] top-[-1000%] focus:static"
  >
    Skip to main content
  </a>
</div>
<header class="navbar mb-6">
  <div class="navbar-start">
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost sm:hidden">HB</div>
      <Nav
        cl="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
      />
    </div>
    <a href="/" class="btn btn-ghost text-2xl">{siteTitle}</a>
  </div>
  <div class="navbar-center hidden sm:flex">
    <Nav cl="menu menu-lg menu-horizontal px-2 gap-2" />
  </div>
  <div class="navbar-end"></div>
</header>
