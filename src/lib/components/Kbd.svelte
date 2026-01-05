<script lang="ts">
  interface Props {
    seq: string
  }

  const { seq }: Props = $props()

  const keys = $derived(seq.split('-'))
</script>

<span class="whitespace-nowrap">
  {#each keys as key, i}
    <kbd class="kbd">{key}</kbd>&nbsp;{#if i < keys.length - 1}+{/if}&nbsp;
  {/each}
</span>
