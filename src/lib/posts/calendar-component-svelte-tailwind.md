---
title: Localized Calendar Component with Svelte and TailwindCSS
date: 2024-08-01T15:36:00Z
updated: 2025-11-19T07:46:00Z
categories:
  - svelte
  - tailwind
  - javascript
  - webdev
  - tutorial
coverImage: true
coverCredits: Photo by Renáta-Adrienn on Unsplash
coverAlt: A paper calendar book with a pen and a delicate green plant laid on top of it
excerpt: >
  Let's create a localized monthly calendar component together, using Svelte and TailwindCSS with minimal dependencies. To achieve this result, we explore the internationalization APIs of JavaScript and use some clever maths to generate a simple markup. After detailing each piece of the puzzle, we put everything together into a simple but customizable demo which can serve as the basis for your calendar needs.
---

<script lang="ts">
  import map from './calendar-component-svelte-tailwind/first-day-of-week-map.png?enhanced&imgSizes=true'
  import ChatNote from '$lib/components/ChatNote.svelte'
  import Image from '$lib/components/Image.svelte'
  import LocalePicker from './calendar-component-svelte-tailwind/LocalePicker.svelte'
  import Calendar from './calendar-component-svelte-tailwind/Calendar.svelte'

  let locale = $state<string | undefined>(undefined)

  const handler = (newValue: string) => {
    locale = newValue
  }
</script>

## Contents

## Introduction

Recently, I needed to create a localized calendar view for a website and decided to craft it from scratch, instead of
relying on a pre-made component. I often prefer this approach when developing with [Svelte](https://svelte.dev/) because
it reduces the number of dependencies of the project and allows to really understand how things work under the hood.
This in turns makes maintenance or customization easier and it's also fun!

In recent years/months, browser support for internationalization in JavaScript has reached an "okay" level, and it was
surprisingly easy to achieve a satisfactory result that works for most locales without relying on an external library
(except for a polyfill).

## HTML Markup

We want to display our monthly calendar view as a table, like you're probably used to seeing. Each column will represent
a day, and each row will represent a week. Since we want our view to update according to the locale's preferences, the
first column will sometimes represent Monday, sometimes Sunday or Saturday, sometimes even
[Friday](https://en.wikipedia.org/wiki/Week).

<Image
  src={map}
  alt="A world map showing each country with a color representing which day of the week is considered the first in
  calendars"
  caption="World map showing the first day of the week used in different countries."
  source="https://en.m.wikipedia.org/wiki/File:First_Day_of_Week_World_Map.svg"
/>

Since html tables are painful to work with and stylize, I opted for a collection of `<div>` elements arranged with CSS
into a grid thanks to the `display: grid` property.

<ChatNote>
<strong>Note</strong>: I'm using <a href="https://tailwindcss.com/" rel="nofollow">TailwindCSS</a> in the markup below,
but the same result can be (painfully) achieved with regular CSS too! You can look up the relevant classes in their docs
to find the corresponding CSS code. The button class comes from
<a href="https://daisyui.com/" rel="nofollow">DaisyUI</a>.
</ChatNote>

The base of our layout will be the following:

```html
<div>
  <!-- title and navigation -->
  <div class="flex flex-nowrap items-center text-center">
    <div>
      <button class="btn" aria-label="See previous month">
        &lt; <!-- left chevron -->
      </button>
    </div>
    <h2 class="grow whitespace-nowrap">
      <!--
        this will be formatted according to the
        locale date formatting and translated
      -->
      Month 20xx
    </h2>
    <div>
      <button class="btn" aria-label="See next month">
        &gt; <!-- right chevron -->
      </button>
    </div>
  </div>
  <!-- header row -->
  <div class="grid grid-cols-7 justify-items-center">
    <!--
      first item might sometimes be another day
      and will be translated
    -->
    <div>Monday</div>
    <div>Tuesday</div>
    <!-- ... -->
  </div>
  <!-- days table -->
  <div class="grid grid-cols-7 justify-items-center">
    <!--
      the number in the class name below will change
      for each month and depending on the locale
    -->
    <div class="first:col-start-1">1</div>
    <div class="first:col-start-1">2</div>
    <!-- ... -->
  </div>
</div>
```

The first thing to note is that we use the `.grid .grid-cols-7` classes for the heading row (with the day names) and the
main table-like `<div>`. This creates a grid with 7 columns as you might expect (gotta love Tailwind for this).

The `.justify-items-center` ensures that each child `<div>` is horizontally centered inside of its grid cell.

Finally and most importantly, not each month will have its first day on a Monday (or whichever the first column day is
according to the locale). As such, we have to skip a few cells to move the first day `<div>` into the right column. This
is achieved with the [`.col-start-*`](https://tailwindcss.com/docs/grid-column#starting-and-ending-lines) classes and
should only be applied to the first day element. It will automatically offset the next elements along with it, and all
elements will wrap according to our preference of 7 columns.

Since we want to generate those elements dynamically using JavaScript, it's easier if we apply the same classes to each
day element (to avoid conditionals), so we prepend our class with
[`first:`](https://tailwindcss.com/docs/hover-focus-and-other-states#first-last-odd-and-even), which will only apply to
the element if it's the first child of its parent.

## Generating the Localized Data

Ok, we have a markup template, we now need to populate it with localized data. For this, we need to have the following,
knowing the currently displayed month and year:

- the month title (with year),
- which day is the first day of the week for the locale,
- the list of the day names, starting with the first day of the week for the locale,
- the last day of the month, or how many days are in the displayed month,
- and in which column should the first day of the displayed month land.

There is a bit of math below, but I promise it's not going to be too complicated! I'm going to do my best to explain how
it works.

### Month Title

This is probably the easiest bit, and we can retrieve the formatted month and year title with the following code,
relying on the
[`Date.toLocaleString()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)
method:

```typescript
const monthTitle = $derived(
  new Date(year, month, 1).toLocaleString(locale, {
    month: "long",
    year: "numeric",
  }),
);
```

<ChatNote>
In the code above, <code>locale</code>, <code>year</code> and <code>month</code> are reactive pieces of state in Svelte,
so we derive a new reactive variable with the
<a href="https://svelte-5-preview.vercel.app/docs/runes" rel="nofollow"><code>$derived</code> rune</a>. The derived
value will reactively update any time any of its dependencies change.
</ChatNote>

### First Day of the Week

JavaScript provides an API to retrieve information about the week structure for a locale via the
[`Intl.Locale.getWeekInfo()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo)
method. Browser support is not exactly great for this API (some browsers expose it via a `weekInfo` property instead,
some browsers don't have it at all), so we use the following polyfill to level the playing field:
[`@formatjs/intl-locale`](https://github.com/formatjs/formatjs).

According to the API docs, this method returns an object with a `firstDay` key as an integer, where `1` is Monday and
`7` is Sunday:

```typescript
const firstDayOfWeek = $derived(
  new Intl.Locale(locale).getWeekInfo().firstDay,
);
```

### List of Day Names

To get the list of day names, we will similarly use the i18n capabilities of JavaScript, this time with a twist. Since
we are localizing multiple dates (one for each day of the week) with the same formatting, we can optimize our code by
first constructing a
[`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format)
object and re-using it to format multiple dates. This speeds up execution as the heavy data for the locale is only
loaded once instead of once per call.

```typescript
const dateTimeFormat = $derived(
  new Intl.DateTimeFormat(locale, { weekday: "short" }),
);
const dayNames = $derived(
  Array.from(
    { length: 7 },
    (_, i) =>
      dateTimeFormat.format(
        new Date(2018, 0, i + firstDayOfWeek),
      ),
  ),
);
```

The list must start with the correct day according to `firstDayOfWeek` defined above. We leverage the fact that year
2018 started on a Monday to generate the list of days starting with the correct day. With our index `i` starting at
zero, we simply add our `firstDayOfWeek` to retrieve the the date which corresponds to the day name. Note that `Date()`
indexes months starting at zero, so month `0` is January (for some reason...).

### Last Day of the Month

To get the number of days in the displayed month, we use another JavaScript trick. The `Date()` object will not complain
if we give it a day or month index that is invalid (_e.g._ `32` for the day number), and will instead wrap as necessary
to land on a valid date. As such, `Date(2018, 0, 32)` gives `Thu Feb 01 2018`. Likewise, we can retrieve the last day of
January with `Date(2018, 1, 0)` (remember that days start at 1 normally), which gives `Wed Jan 31 2018`.

If we now were to try `Date(2018, 12, 1)`, we would get `Tue Jan 01 2019` (remember that months start at 0).

Armed with this knowledge, we can now find the last day in `month` (1-indexed):

```typescript
const lastDay = $derived(
  new Date(year, month + 1, 0).getDate(),
);
```

### Column Offset for the First Day

In the markup section above, we determined that we need to offset the first item in the table by a number of rows so
that it ends up in the correct column. This involves a bit of simple math and can be achieved like so:

```typescript
const firstDayColumn = $derived(
  (
    (
      new Date(year, month, 1).getDay() + 7 - firstDayOfWeek
    ) % 7
  ) + 1,
);
```

First, we construct a date object for the first day of the displayed month, then we retrieve the corresponding day of
the week with `getDay()`. This returns `0` for Sunday, `1` for Monday, etc.

Let's imagine we are in August 2024, and so the values we get from `getDay()` is 4, as the month starts on a Thursday.
Let's also imagine for the example that we are dealing with the `fr` locale which gave us `firstDayOfWeek = 1`.

By subtracting our value `firstDayOfWeek`, for our example, we end up with `4 - 1 = 3`. So, we need to offset the day
cell by 3 columns to the right. Brilliant!

Now we need to adjust a couple of things after the subtraction, because if `getDay()` returns a number smaller than our
`firstDayOfWeek`, we will end up with a negative number. To avoid this, we add `7` to the result, and then apply a
modulo `7` to the result to end up in the `0-6` range.

Since the `.col-start-*` class is not an offset but a starting index, we finally add `1` to the result of the
calculation to get the column index (starting at 1).

## Svelte Component

Phew, now that the maths are out of the way, let's see how we can construct our component with the pieces described
until now.

I want the component to expose a `prop` named `locale` which the consumer can use to define the locale string to use.
The default value will be `en`:

```typescript
interface Props {
  locale?: string;
}
let { locale = "en" }: Props = $props();
```

Then, I need two state variables to store the year and month, and we will initialize them with the current date:

```typescript
let year = $state(new Date().getFullYear());
let month = $state(new Date().getMonth());
```

It could be interesting to also expose those as props and would be easy enough to do, but it's not required for this
demo.

To generate the list of all day cells, we also need such a list that contains all numbers from 1 to the `lastDay` that
we calculated previously. We create a helper `range` function:

```typescript
// Helper method to generate a range of integers from `start` to `end`, inclusive
const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
};
```

We should also be able to increment and decrement the month and year counters. Knowing how the `Date()` object works, we
know it's a simple as:

```typescript
<button class="btn" onclick={() => month--} aria-label="See previous month">
  &lt;
</button>
<!-- ... -->
<button class="btn" onclick={() => month++} aria-label="See next month">
  &lt;
</button>
```

The overflow to the next or previous year will be handled properly. We could also do something like below, which would
be less "hacky" and would be necessary if we relied on the `year` and `month` variables for anything else than the input
to the `Date` constructor:

```typescript
const prevMonth = () => {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
};
const nextMonth = () => {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
};
```

The title is simply:

```svelte
<h2 class="grow whitespace-nowrap">
  {monthTitle}
</h2>
```

The row with the day names is constructed as follows:

```svelte
<div class="grid grid-cols-7 justify-items-center">
  {#each dayNames as dayName}
    <div>{dayName}</div>
  {/each}
</div>
```

And the table is generated with:

```svelte
<div class="grid grid-cols-7 justify-items-center">
  {#each range(1, lastDay) as day}
    <div class={`first:col-start-${firstDayColumn}`}>
      {day}
    </div>
  {/each}
</div>
```

Since we dynamically generate the class name for the column offset, the Tailwind compiler doesn't pick them up and will
tree-shake them out of your CSS (depending on your config). In order to ensure they stay present in the final bundle,
the CSS file can be edited to
[inline them](https://tailwindcss.com/docs/detecting-classes-in-source-files#safelisting-specific-utilities):

```css
@import "tailwindcss";
@source inline("first:col-start-{1..7}");
```

## The Result

Here's the final result after implementing all the things discussed in this article. You can play with it below!<br> The
[full component source code](https://github.com/beeb/beeb-li/blob/main/src/lib/posts/calendar-component-svelte-tailwind/Calendar.svelte)
is available on GitHub.

<div class="not-prose w-full">
  <LocalePicker {handler} />
  <Calendar {locale} />
</div>

## Conclusion

Throughout this article, we've seen how we can leverage modern web APIs to create a localized Svelte component which
serves content tailored to the user's preferences. We've also derived a couple of maths formulae to produce the correct
markup for displaying a monthly calendar view.

I hope you found this article useful and could learn a thing or two about using JavaScript APIs for the localization of
your front-end applications.

'Till next time!

## Updated 2025-11-19

Instructions have been changed to align with TailwindCSS v4 (regarding safelisting some classes).

*[API]: Application Programming Interface

*[HTML]: Hypertext Markup Language

*[CSS]: Cascading Style Sheets

*[i18n]: internationalization
