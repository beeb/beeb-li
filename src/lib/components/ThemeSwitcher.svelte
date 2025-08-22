<script lang="ts">
  import Sun from 'virtual:icons/mingcute/sun-fill'
  import Moon from 'virtual:icons/mingcute/moon-fill'
  import type { ChangeEventHandler } from 'svelte/elements'

  const KEY_NAME = 'light-theme-enabled'

  let light = $state(false)
  $effect(() => {
    const value = localStorage.getItem(KEY_NAME)
    if (value) {
      const checked = JSON.parse(value)
      if (checked === true) {
        light = true
      }
    } else if (window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        light = true
        // localStorage.setItem(KEY_NAME, JSON.stringify(true));
      }
    }
  })

  $effect(() => {
    if (light) {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  })

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    localStorage.setItem(KEY_NAME, JSON.stringify(e.currentTarget.checked))
  }
</script>

<label class="flex items-center cursor-pointer gap-2" aria-label="Switch Between Light and Dark Themes">
  <Moon />
  <input
    type="checkbox"
    value="light"
    bind:checked={light}
    onclick={handleChange}
    class="toggle toggle-sm theme-controller"
    id="theme-controller"
  />
  <Sun />
</label>
