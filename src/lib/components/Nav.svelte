<script lang="ts">
  import { navItems } from '$lib/config'
  import { page } from '$app/stores'

  const { ...allProps } = $props()
</script>

<ul {...allProps}>
  <li>
    <a href="/" class={($page.route.id ?? '') === '/' ? 'active' : ''}> Home </a>
  </li>
  {#each navItems as p}
    <li>
      <a href={p.route} class:active={($page.route.id ?? '').startsWith(p.route)}>{p.title}</a>
    </li>
  {/each}
</ul>
