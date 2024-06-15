<script lang="ts">
  type Entry = { text: string; prefix?: string; cl?: string } | string

  export let entries: Entry[] = []
</script>

<div class="mockup-code">
  {#each entries as entry}
    {#if typeof entry === 'string'}
      <pre data-prefix="$"><code>{entry}</code></pre>
    {:else if entry.prefix === ''}
      <pre class={entry.cl}><code class="ml-1">{entry.text}</code></pre>
    {:else}
      <pre data-prefix={entry.prefix ?? '$'} class={entry.cl}><code>{entry.text}</code></pre>
    {/if}
  {/each}
</div>
