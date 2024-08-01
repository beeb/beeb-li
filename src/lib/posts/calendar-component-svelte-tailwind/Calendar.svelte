<script lang="ts">
  // A simple calendar component that displays the days of the month in a grid, with previous and next month buttons
  // Note that some dynamic tailwind classes are not detected by the compiler and must be manually added to the config
  // file:
  // ```js
  // // tailwind.config.js
  // export default {
  //   safelist: [{ pattern: /^col-start-/, variants: ['first'] }],
  // }
  // ```

  // polyfill for the `Intl.Locale` object, which does not provide `getWeekInfo` in some browsers
  import '@formatjs/intl-locale/polyfill-force'

  interface Props {
    locale?: string
  }
  let { locale = 'en' }: Props = $props()

  // App state for the prev/next buttons, starts with the current month
  let year = $state(new Date().getFullYear())
  let month = $state(new Date().getMonth())

  // 1 for Monday, 7 for Sunday
  // This method requires a polyfill as some browsers expose `weekInfo` as a prop instead of a method, and some don't
  // have it at all (Firefox, I'm looking at you!)
  const firstDayOfWeek = $derived(new Intl.Locale(locale).getWeekInfo().firstDay)

  // Since the first column of the view is the first day of the week, we need to offset the first cell so that it lands
  // in the right column.
  // We add 7 before subtracting the first day index to ensure we get a positive number.
  const firstDayColumn = $derived(((new Date(year, month, 1).getDay() + 7 - firstDayOfWeek) % 7) + 1)

  // The localized month name and year
  const monthTitle = $derived(new Date(year, month, 1).toLocaleString(locale, { month: 'long', year: 'numeric' }))

  // How many days are in the month
  // We use the fact that `Date` is pretty lenient when it comes to month and day values
  // Passing it a day value of 0 will return the last day of the previous month
  // Likewise, passing `month + 1` for december correctly matches January of the next year
  const lastDay = $derived(new Date(year, month + 1, 0).getDate())

  // List of the weekday names, starting with the first day of the week (locale-aware)
  const dateTimeFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }))
  const dayNames = $derived(
    Array.from({ length: 7 }, (_, i) => dateTimeFormat.format(new Date(2018, 0, i + firstDayOfWeek)))
  )

  // Helper method to generate a range of integers from `start` to `end`, inclusive
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
  }
</script>

<div class="w-full max-w-lg mx-auto overflow-x-scroll rounded-box border border-neutral p-4">
  <div class="min-w-80 flex flex-col gap-4">
    <div class="flex flex-nowrap items-center text-center sm:text-xl">
      <div>
        <button class="btn btn-ghost text-xl font-normal" onclick={() => month--} aria-label="See previous month">
          &lt;
        </button>
      </div>
      <h2 class="grow whitespace-nowrap">
        {monthTitle}
      </h2>
      <div>
        <button class="btn btn-ghost text-xl font-normal" onclick={() => month++} aria-label="See next month">
          &gt;
        </button>
      </div>
    </div>
    <div class="grid grid-cols-7 justify-items-center text-sm sm:text-base opacity-80">
      {#each dayNames as dayName}
        <div>{dayName}</div>
      {/each}
    </div>
    <div class="grid grid-cols-7 justify-items-center">
      {#each range(1, lastDay) as day}
        <div class={`first:col-start-${firstDayColumn} h-10 text-base sm:text-lg`}>
          {day}
        </div>
      {/each}
    </div>
  </div>
</div>
