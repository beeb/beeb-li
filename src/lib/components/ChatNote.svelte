<script lang="ts">
  import type { Snippet } from 'svelte'
  import cartoon from '$lib/assets/beeb_cartoon.png?enhanced'

  interface Props {
    children: Snippet
  }

  const { children }: Props = $props()
</script>

<div class="chat chat-end">
  <div class="chat-image avatar">
    <div class="w-24">
      <enhanced:img class="m-0" src={cartoon} alt="A cartoon portrait of the author"></enhanced:img>
    </div>
  </div>
  <div class="chat-bubble chat-bubble-neutral rounded-box">
    {@render children()}
  </div>
</div>

<style>
  :global(html[data-theme='light'] .chat-bubble-neutral a) {
    color: oklch(0.8585 0.0792 182.75) !important;
  }
  :global(html[data-theme='light'] .chat-bubble-neutral a:visited) {
    color: oklch(0.7871 0.1187 304.77) !important;
  }
  :global(html[data-theme='light'] .chat-bubble-neutral strong) {
    color: var(--color-neutral-content) !important;
  }
  :global(html[data-theme='light'] .chat-bubble-neutral code) {
    color: var(--tw-prose-code) !important;
  }
  :global(html[data-theme='light'] .chat-bubble-neutral figcaption) {
    color: var(--color-neutral-content) !important;
  }
</style>
