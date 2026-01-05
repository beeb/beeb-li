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
        theme: 'catppuccin',
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
      <img src={`${fallback}.svg`} alt="A still from an Asciinema terminal screencast" />
    </a>
  </noscript>
{/if}

<style>
  :global(.asciinema-player-theme-catppuccin) {
    --term-color-foreground: #cdd6f4;
    --term-color-background: #1e1e2e;
    --term-color-0: #45475a;
    --term-color-1: #f38ba8;
    --term-color-2: #a6e3a1;
    --term-color-3: #f9e2af;
    --term-color-4: #89b4fa;
    --term-color-5: #f5c2e7;
    --term-color-6: #94e2d5;
    --term-color-7: #bac2de;
    --term-color-8: #585b70;
    --term-color-9: #f38ba8;
    --term-color-10: #a6e3a1;
    --term-color-11: #f9e2af;
    --term-color-12: #89b4fa;
    --term-color-13: #f5c2e7;
    --term-color-14: #94e2d5;
    --term-color-15: #a6adc8;
  }
</style>
