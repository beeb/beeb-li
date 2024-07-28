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

  // 0 for Sunday, 1 for Monday (to match the `Date.getDay()` method)
  // This method requires a polyfill as some browsers expose `weekInfo` as a prop instead of a method, and some don't
  // have it at all (Firefox, I'm looking at you!)
  const firstDayOfWeek = $derived(new Intl.Locale(locale).getWeekInfo().firstDay % 7)

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
  const dayNames = $derived(
    Array.from({ length: 7 }, (_, i) =>
      new Date(2017, 0, i + 1 + firstDayOfWeek).toLocaleString(locale, { weekday: 'short' })
    )
  )

  // Helper method to generate a range of integers from `start` to `end`, inclusive
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
  }

  // Go to the previous month, wrapping around to December of the previous year
  const prevMonth = () => {
    month--
    if (month < 0) {
      month = 11
      year--
    }
  }

  // Go to the next month, wrapping around to January of the next year
  const nextMonth = () => {
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }
</script>

<div class="w-full mx-auto max-w-lg overflow-x-scroll rounded-box border border-neutral p-4">
  <div class="flex min-w-80 flex-col gap-4">
    <div class="flex w-full flex-nowrap text-center sm:text-xl items-center">
      <div>
        <button class="btn btn-ghost text-xl font-normal" onclick={() => prevMonth()} aria-label="See previous month">
          &lt;
        </button>
      </div>
      <h2 class="grow whitespace-nowrap">
        {monthTitle}
      </h2>
      <div>
        <button class="btn btn-ghost text-xl font-normal" onclick={() => nextMonth()} aria-label="See next month">
          &gt;
        </button>
      </div>
    </div>
    <div class="grid grid-cols-7 justify-items-center text-sm sm:text-base opacity-80">
      {#each dayNames as dayName}
        <div>{dayName}</div>
      {/each}
    </div>
    <div class="flex w-full flex-nowrap">
      <div class="grid w-full grid-cols-7 justify-items-center gap-y-4">
        {#each range(1, lastDay) as day}
          <div class={`text-base sm:text-lg first:col-start-${firstDayColumn}`}>
            {day}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
