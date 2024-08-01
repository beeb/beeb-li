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

<label class="form-control mx-auto max-w-xs flex-row mb-6 gap-6">
  <div class="label">
    <span>Change the locale:</span>
  </div>
  <select class="select select-bordered" bind:value={locale}>
    {#each locales as locale}
      <option>{locale}</option>
    {/each}
  </select>
</label>
