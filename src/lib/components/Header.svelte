<script lang="ts">
  import Nav from "$lib/components/Nav.svelte";
  import ThemeSwitcher from "$lib/components/ThemeSwitcher.svelte";
  import { siteTitle } from "$lib/config";
  import Hamburger from "virtual:icons/mingcute/menu-fill";

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
<header class="navbar mb-8">
  <div class="navbar-start gap-2 w-full sm:w-1/3">
    <div class="dropdown sm:hidden">
      <div tabindex="0" role="button" class="btn btn-ghost">
        <Hamburger />
      </div>
      <Nav
        class="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
      />
    </div>
    <a href="/" class="text-2xl text-primary font-black">{siteTitle}</a>
  </div>
  <div class="navbar-end w-2/3 gap-4">
    <ThemeSwitcher />
    <Nav class="hidden sm:flex menu text-lg menu-horizontal px-2 gap-2" />
  </div>
</header>
