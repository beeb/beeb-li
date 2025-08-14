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
      <enhanced:img
        class="m-0"
        src={cartoon}
        alt="A cartoon portrait of the author"
      ></enhanced:img>
    </div>
  </div>
  <div class="chat-bubble rounded-box">
    {@render children()}
  </div>
</div>
