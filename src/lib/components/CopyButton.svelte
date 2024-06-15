<script lang="ts">
  import ClipboardIcon from 'virtual:icons/lucide/clipboard-copy'
  import ClipboardSuccess from 'virtual:icons/lucide/clipboard-check'
  import ClipboardError from 'virtual:icons/lucide/clipboard-x'

  export let content = ''
  export let cl = ''

  let clipboardIcon: 'default' | 'success' | 'error' = 'default'

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

<button
  class="btn-link btn-sm btn text-neutral-content {cl}"
  class:!text-success={clipboardIcon === 'success'}
  class:!text-error={clipboardIcon === 'error'}
  title="Copy to clipboard"
  aria-label="Copy to clipboard"
  on:click={() => copyToClipboard(content)}
>
  {#if clipboardIcon === 'default'}
    <ClipboardIcon />
  {:else if clipboardIcon === 'success'}
    <ClipboardSuccess />
  {:else}
    <ClipboardError />
  {/if}
</button>
