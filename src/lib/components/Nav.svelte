<script lang="ts">
  import { navItems } from '$lib/config'
  import { page } from '$app/state'

  const { ...allProps } = $props()
</script>

<ul {...allProps}>
  <li>
    <a href="/" class:menu-active={(page.route.id ?? '') === '/'}> Home </a>
  </li>
  {#each navItems as p}
    <li>
      <a href={p.route} class:menu-active={(page.route.id ?? '').startsWith(p.route)}>{p.title}</a>
    </li>
  {/each}
</ul>
