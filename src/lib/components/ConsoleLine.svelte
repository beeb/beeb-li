<script lang="ts">
  import { building } from '$app/environment'
  import ClipboardIcon from 'virtual:icons/mingcute/clipboard-line'

  export let entry: Entry

  let clipboardIcon: 'default' | 'success' | 'error' = 'default'

  $: entryText = typeof entry === 'string' ? entry : entry.text
  $: copy = typeof entry === 'string' ? true : entry.copy

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => {
          clipboardIcon = 'success'
        },
        () => {
          clipboardIcon = 'error'
        }
      )
    } else {
      clipboardIcon = 'error'
    }
    setTimeout(() => {
      clipboardIcon = 'default'
    }, 3000)
  }
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
    <button
      class="btn-link btn-sm btn text-neutral-content"
      class:!text-success={clipboardIcon === 'success'}
      class:!text-error={clipboardIcon === 'error'}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
      on:click={() => copyToClipboard(entryText)}
    >
      <ClipboardIcon />
    </button>
  {/if}
</div>
