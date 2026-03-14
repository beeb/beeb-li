<script lang="ts">
  export type CellVariant = 'default' | 'newline' | 'nonascii' | 'negative' | 'set' | 'unset' | 'final'

  export type Cell = {
    label: string
    variant?: CellVariant
  }

  interface Props {
    cells: Cell[]
    label?: string
  }

  const { cells, label }: Props = $props()
</script>

<div class="flex items-center justify-center gap-3 py-1.5 font-mono text-xs not-prose">
  <span class="w-24 shrink-0 text-right">{label}</span>
  <div class="flex gap-1 flex-nowrap overflow-x-auto">
    {#each cells as cell}
      <div
        class={[
          'flex items-center justify-center w-10 h-9 shrink-0 rounded-sm border border-base-content/15 bg-base-200 text-base-content',
          cell.variant,
        ]}
      >
        {cell.label}
      </div>
    {/each}
    <div class="flex items-center justify-center">...</div>
  </div>
</div>

<style lang="postcss">
  @reference '../../../app.css';

  .newline {
    @apply text-warning border-warning bg-warning/10;
  }

  .nonascii {
    @apply text-info border-info bg-info/10;
  }

  .negative {
    @apply text-error border-error bg-error/10;
  }

  .set {
    @apply text-success border-success bg-success/10;
  }

  .unset {
    @apply text-base-content/50 border-base-content/10 bg-base-300;
  }

  .final {
    @apply font-bold text-base-content border-base-content;
  }
</style>
