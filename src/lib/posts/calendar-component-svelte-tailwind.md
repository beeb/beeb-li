---
title: Simple Calendar Component with Svelte and TailwindCSS
date: 2024-07-28T18:27:00Z
# updated:
categories:
  - svelte
  - tailwind
  - webdev
  - tutorial
coverImage: false
#coverCredits: Photo by ... on Unsplash
#coverAlt: ""
excerpt: >
  Calendar component
---

<script lang="ts">
  import LocalePicker from './calendar-component-svelte-tailwind/LocalePicker.svelte'
  import Calendar from './calendar-component-svelte-tailwind/Calendar.svelte'

  let locale = $state<string | undefined>(undefined)

  const handler = (newValue: string) => {
    locale = newValue
  }
</script>

## Contents

## Introduction

Recently, I needed to create a simple calendar view for a website and decided to craft it from scratch, instead of relying on a pre-made component. I often prefer this approach when developing with [Svelte](https://svelte.dev/) because
it reduces the number of dependencies of the project and allows to really understand how things work under the hood.
This in turns makes maintenance or changes easier and it's also fun!

In recent years/months, browser support for internationalization in JavaScript has reached an "okay" level, and it was
surprisingly easy to achieve a satisfactory result that works for most locales without relying on an external library.

## The Result

Here's the final result after implementing all the things discussed in this article. The [full component source code](https://github.com/beeb/beeb-li/blob/main/src/lib/posts/calendar-component-svelte-tailwind/Calendar.svelte) is available on GitHub. Bear in mind some of the styles come from [DaisyUI](https://daisyui.com/).

<div class="not-prose w-full">
  <LocalePicker {handler} />
  <Calendar {locale} />
</div>

## Conclusion

