---
title: Localized Calendar Component with Svelte and TailwindCSS
date: 2024-07-28T18:27:00Z
# updated:
categories:
  - svelte
  - tailwind
  - webdev
  - tutorial
coverImage: true
coverCredits: Photo by Renáta-Adrienn on Unsplash
coverAlt: A paper calendar book with a pen and a delicate green plant laid on top of it
excerpt: >
  Calendar component TODO
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
This in turns makes maintenance or changes easier and it's also fun!

In recent years/months, browser support for internationalization in JavaScript has reached an "okay" level, and it was
surprisingly easy to achieve a satisfactory result that works for most locales without relying on an external library
(except for a small polyfill).

## HTML Markup

We want to display our monthly calendar view as a table, like you're probably used to seeing. Each column will represent
a weekday, and each row will represent a week. Since we want our view to update according to the locale's preferences,
the first column will sometimes represent Monday, sometimes Sunday or Saturday, sometimes even [Friday](https://en.m.wikipedia.org/wiki/Week).

<Image
  src={map}
  alt="A world map showing each country with a color representing which day of the week is considered the first in
  calendars"
  caption="World map showing the first day of the week used in different countries."
  source="https://en.m.wikipedia.org/wiki/File:First_Day_of_Week_World_Map.svg"
/>

Since html tables are painful to work with and style, I opted for a collection of `<div>`'s arranged with CSS into a
grid thanks to the `display: grid` property.

<ChatNote>
<strong>Note</strong>: I'm using <a href="https://tailwindcss.com/" rel="nofollow">TailwindCSS</a> in the markup below, but the same result can be
(painfully) achieved with regular CSS too! You can look up the relevant classes in their docs to find the corresponding
CSS code.
</ChatNote>

As such, the base of our layout will be:

```html
<div class="flex flex-col gap-4">
  <div class="flex w-full flex-nowrap text-center items-center">
    <div>
      <button class="btn" aria-label="See previous month">
        &lt; <!-- left chevron -->
      </button>
    </div>
    <h2 class="grow whitespace-nowrap">
      Month 20xx <!-- this will be formatted according to the locale date formatting and translated -->
    </h2>
    <div>
      <button class="btn" aria-label="See next month">
        &gt; <!-- right chevron -->
      </button>
    </div>
  </div>
  <div class="grid grid-cols-7 justify-items-center">
    <div>Monday</div> <!-- this might sometimes be another day and will be translated -->
    <div>Tuesday</div>
    <!-- ... -->
  </div>
  <div class="flex w-full flex-nowrap">
    <div class="grid w-full grid-cols-7 justify-items-center gap-y-4">
      <!-- the number in the class name below will change for each month -->
      <div class="first:col-start-1">
        1
      </div>
      <div class="first:col-start-1">
        2
      </div>
    </div>
  </div>
</div>
```

## The Result

Here's the final result after implementing all the things discussed in this article. The [full component source code](https://github.com/beeb/beeb-li/blob/main/src/lib/posts/calendar-component-svelte-tailwind/Calendar.svelte) is available on GitHub. Bear in mind some of the styles come from [DaisyUI](https://daisyui.com/).

<div class="not-prose w-full">
  <LocalePicker {handler} />
  <Calendar {locale} />
</div>

## Conclusion

*[CSS]: Cascading Style Sheets