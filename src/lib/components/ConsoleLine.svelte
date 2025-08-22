<script lang="ts">
  import { building } from '$app/environment'
  import CopyButton from '$lib/components/CopyButton.svelte'

  interface Props {
    entry: Entry | string
  }

  const { entry }: Props = $props()

  const entryText = $derived(typeof entry === 'string' ? entry : entry.text)
  const copy = $derived(typeof entry === 'string' ? true : entry.copy)
</script>

<div class="flex flex-nowrap items-center text-lg">
  {#if typeof entry === 'string'}
    <pre data-theme="dark" data-prefix="$" class="grow text-wrap pl-8! -indent-8 break-words"><code>{entry}</code></pre>
  {:else if entry.prefix === ''}
    <pre data-theme="dark" class="before:mr-0! ml-6! grow text-wrap break-words {entry.cl}"><code>{entry.text}</code
      ></pre>
  {:else}
    <pre
      data-theme="dark"
      data-prefix={entry.prefix ?? '$'}
      class="grow text-wrap pl-8! -indent-8 break-words {entry.cl}"><code>{entry.text}</code></pre>
  {/if}

  {#if copy && !building}
    <CopyButton content={entryText} />
  {/if}
</div>
