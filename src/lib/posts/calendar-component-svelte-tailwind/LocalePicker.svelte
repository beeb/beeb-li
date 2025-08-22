<script lang="ts">
  interface Props {
    handler: (newValue: string) => void
  }

  let { handler }: Props = $props()

  const locales = ['en-US', 'en-GB', 'dv-MV', 'fr-CH', 'kab']
  let locale = $state(locales[0])

  $effect(() => {
    handler(locale)
  })
</script>

<div class="flex justify-center mb-4">
  <label class="select">
    <span class="label">Locale</span>
    <select bind:value={locale}>
      {#each locales as locale}
        <option>{locale}</option>
      {/each}
    </select>
  </label>
</div>
<!-- <label class="form-control mx-auto max-w-xs flex-row mb-6 gap-6">


</label> -->
