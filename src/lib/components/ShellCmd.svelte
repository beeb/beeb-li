<script lang="ts">
</script>

<div class="mockup-code">
  <pre data-prefix="$"><code><slot name="1" /></code></pre>
  {#if $$slots[2]}
    <pre data-prefix="$"><code><slot name="2" /></code></pre>
  {/if}
  {#if $$slots[3]}
    <pre data-prefix="$"><code><slot name="3" /></code></pre>
  {/if}
  {#if $$slots[4]}
    <pre data-prefix="$"><code><slot name="4" /></code></pre>
  {/if}
  {#if $$slots[5]}
    <pre data-prefix="$"><code><slot name="5" /></code></pre>
  {/if}
</div>
