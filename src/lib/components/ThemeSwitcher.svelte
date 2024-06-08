<script lang="ts">
  import { onMount } from "svelte";
  import Sun from "virtual:icons/mingcute/sun-fill";
  import Moon from "virtual:icons/mingcute/moon-fill";

  const KEY_NAME = "dark-theme-enabled";

  let dark = false;

  onMount(() => {
    let value = localStorage.getItem(KEY_NAME);
    if (value) {
      const checked = JSON.parse(value);
      if (checked === true) {
        dark = true;
      }
    } else {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        dark = true;
        localStorage.setItem(KEY_NAME, JSON.stringify(true));
      }
    }
  });
  function handleChange() {
    localStorage.setItem(KEY_NAME, JSON.stringify(dark));
  }
</script>

<label class="flex items-center cursor-pointer gap-2">
  <Sun />
  <input
    type="checkbox"
    value="dark"
    bind:checked={dark}
    on:change={handleChange}
    class="toggle theme-controller"
    id="theme-controller"
  />
  <Moon />
</label>
