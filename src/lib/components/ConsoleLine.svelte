<script lang="ts">
  import { building } from '$app/environment'
  import CopyButton from '$lib/components/CopyButton.svelte'

  export let entry: Entry

  $: entryText = typeof entry === 'string' ? entry : entry.text
  $: copy = typeof entry === 'string' ? true : entry.copy
</script>

<div class="flex no-wrap items-center">
  {#if typeof entry === 'string'}
    <pre data-prefix="$" class="grow"><code>{entry}</code></pre>
  {:else if entry.prefix === ''}
    <pre class="before:!mr-0 !ml-6 grow {entry.cl}"><code>{entry.text}</code></pre>
  {:else}
    <pre data-prefix={entry.prefix ?? '$'} class="grow {entry.cl}"><code>{entry.text}</code></pre>
  {/if}

  {#if copy && !building}
    <CopyButton content={entryText} />
  {/if}
</div>
