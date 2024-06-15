<script lang="ts">
  import type { Picture } from 'vite-imagetools'

  export let src: Picture
  export let caption: string | undefined
  export let alt: string
  export let maxWidth: number | undefined
  export let link = true

  $: sizes = maxWidth
    ? `(min-width: ${maxWidth + 48}px) ${maxWidth}px, calc(100vw - 48px)`
    : '(min-width: 1024px) 976px, calc(100vw - 48px)'
</script>

<figure class="flex flex-col items-center">
  {#if link}
    <a href={src.img.src}>
      <enhanced:img
        {src}
        {sizes}
        {alt}
        {...$$restProps}
        style={maxWidth ? `width: 100%; max-width: ${maxWidth}px` : ''}
      />
    </a>
  {:else}
    <enhanced:img
      {src}
      {sizes}
      {alt}
      {...$$restProps}
      style={maxWidth ? `width: 100%; max-width: ${maxWidth}px` : ''}
    />
  {/if}

  {#if caption}
    <figcaption style={maxWidth ? `max-width: ${Math.max(maxWidth + 100, 500)}px` : ''}>
      {caption}
    </figcaption>
  {/if}
</figure>
