<script lang="ts">
  import ConsoleLine from '$lib/components/ConsoleLine.svelte'
  export let entries: Entry[] = []
</script>

<div class="flex justify-center">
  <div class="mockup-code">
    {#each entries as entry}
      <ConsoleLine {entry} />
    {/each}
  </div>
</div>
