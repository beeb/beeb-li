<script lang="ts">
  import 'asciinema-player/dist/bundle/asciinema-player.css'
  import type { Attachment } from 'svelte/attachments'

  interface Props {
    url: string
    fallback?: string
    cols?: number
    rows?: number
    loop?: boolean | number
  }

  const { url, fallback, rows, cols, loop }: Props = $props()

  const playerAttachment: Attachment = (element) => {
    // Dynamically import asciinema-player only in the browser
    import('asciinema-player').then((AsciinemaPlayer) => {
      AsciinemaPlayer.create(url, element as HTMLElement, {
        idleTimeLimit: 0.5,
        loop,
        cols,
        rows,
      })
    })
  }
</script>

<div {@attach playerAttachment}></div>
{#if fallback}
  <noscript>
    <a href={fallback} target="_blank" title="Watch cast on asciinema.org">
      <img src={`${fallback}.svg`} alt="Placeholder" />
    </a>
  </noscript>
{/if}
