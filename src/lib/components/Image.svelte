<script lang="ts">
import type { Picture } from 'vite-imagetools'

interface Props {
	src: Picture
	caption?: string
	alt: string
	maxWidth?: number
	link?: boolean
	source?: string
}

const { src, caption, alt, maxWidth, link = true, source, ...restProps }: Props = $props()

const sizes = $derived(
	maxWidth
		? `(min-width: ${maxWidth + 48}px) ${maxWidth}px, calc(100vw - 48px)`
		: '(min-width: 1024px) 976px, calc(100vw - 48px)',
)
</script>

{#snippet image()}
  <enhanced:img {src} {sizes} {alt} {...restProps} style={maxWidth ? `width: 100%; max-width: ${maxWidth}px` : ''}
  ></enhanced:img>
{/snippet}

<figure class="flex flex-col items-center">
  {#if link}
    <a href={src.img.src}>
      {@render image()}
    </a>
  {:else}
    {@render image()}
  {/if}

  {#if caption}
    <figcaption style={maxWidth ? `max-width: ${Math.max(maxWidth + 100, 500)}px` : ''}>
      {caption}
      {#if source}
        <cite><a href={source} rel="nofollow">Source</a></cite>
      {/if}
    </figcaption>
  {/if}
</figure>
