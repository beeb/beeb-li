<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children: Snippet
  }

  const { children }: Props = $props()
</script>

<div class="chat chat-end">
  <div class="chat-image avatar">
    <div class="w-24">
      <img class="m-0" alt="Tailwind CSS chat bubble component" src="/beeb_cartoon.png" />
    </div>
  </div>
  <div class="chat-bubble prose-invert">
    {@render children()}
  </div>
</div>

<style>
  .prose-invert :global(a) {
    color: oklch(64.48% 0.156 284.08) !important;
  }
</style>
