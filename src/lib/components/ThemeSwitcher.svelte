<script lang="ts">
  import { onMount } from "svelte";
  import Sun from "virtual:icons/mingcute/sun-fill";
  import Moon from "virtual:icons/mingcute/moon-fill";

  const KEY_NAME = "light-theme-enabled";

  let light = false;

  onMount(() => {
    const value = localStorage.getItem(KEY_NAME);
    if (value) {
      const checked = JSON.parse(value);
      if (checked === true) {
        light = true;
      }
    } else if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        light = true;
        // localStorage.setItem(KEY_NAME, JSON.stringify(true));
      }
    }
  });
  function handleChange() {
    localStorage.setItem(KEY_NAME, JSON.stringify(light));
  }
</script>

<label class="flex items-center cursor-pointer gap-2">
  <Moon />
  <input
    type="checkbox"
    value="light"
    bind:checked={light}
    on:change={handleChange}
    class="toggle toggle-sm theme-controller"
    id="theme-controller"
  />
  <Sun />
</label>
