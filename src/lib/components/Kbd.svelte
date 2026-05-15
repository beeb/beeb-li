<script lang="ts">
  interface Props {
    seq: string
  }

  const { seq }: Props = $props()

  const keys = $derived(seq.split('-'))
</script>

<span class="whitespace-nowrap">
  {#each keys as key, i}
    <kbd class="kbd">{key}</kbd>{#if i < keys.length - 1}&nbsp;+&nbsp;{/if}
  {/each}
</span>
