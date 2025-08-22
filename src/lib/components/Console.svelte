<script lang="ts">
  import ConsoleLine from '$lib/components/ConsoleLine.svelte'

  interface Props {
    entries: Entry[]
  }

  const { entries }: Props = $props()
</script>

<div class="flex justify-center">
  <div class="mockup-code">
    {#each entries as entry}
      <ConsoleLine {entry} />
    {/each}
  </div>
</div>
