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
  <div class="chat-bubble rounded-box">
    {@render children()}
  </div>
</div>
