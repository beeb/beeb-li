<script lang="ts">
  import { onMount } from 'svelte'
  import { siteTitle } from '$lib/config'
  import type { PageData } from './$types'
  import CopyButton from '$lib/components/CopyButton.svelte'

  export let data: PageData

  let article: HTMLElement

  $: ({ title, excerpt, date, updated, coverAlt, coverCredits, categories, enhancedImage, slug } = data.meta)
  $: ({ PostContent } = data)
  $: ogDate = (updated ? new Date(updated) : new Date(date)).toISOString()

  onMount(() => {
    for (const node of article.querySelectorAll("pre[class*='language-'] > code")) {
      new CopyButton({
        // use whatever Svelte component you like here
        target: node,
        props: {
          content: node.textContent ?? '',
          cl: 'absolute top-1 right-1' // requires <pre> to have position: relative;
        }
      })
    }
  })
</script>

<svelte:head>
  <title>{siteTitle} - {title}</title>
  <meta data-key="description" name="description" content={excerpt} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta name="twitter:title" content={title} />
  <meta property="og:description" content={excerpt} />
  <meta name="twitter:description" content={excerpt} />
  <meta property="og:image" content={`${data.baseUrl}/blog/${slug}/og.png?modified=${ogDate}`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="twitter:image" content={`${data.baseUrl}/blog/${slug}/og.png?modified=${ogDate}`} />
  {#if categories}
    {#each categories as category}
      <meta name="article:tag" content={category} />
    {/each}
  {/if}
  <meta property="article:published_time" content={date} />
</svelte:head>

<article bind:this={article}>
  {#if enhancedImage}
    <div class="mb-8 flex flex-col items-end gap-1">
      <figure
        class="flex justify-center items-center max-h-96 overflow-hidden rounded-box"
        aria-describedby="cover-image-credits"
      >
        <enhanced:img
          class="object-cover"
          src={enhancedImage}
          alt={coverAlt ?? ''}
          sizes="
          (min-width: 1024px) 976px,
          calc(100vw - 48px)
        "
        />
      </figure>
      {#if coverCredits}
        <small id="cover-image-credits" class="opacity-50">{coverCredits}</small>
      {/if}
    </div>
  {/if}

  <div class="prose sm:prose-lg w-full max-w-full mb-8">
    <h1>{title}</h1>
  </div>

  <aside class="flow-root rounded-lg bg-base-200 border border-base-300 py-3 shadow mb-8 max-w-lg">
    <dl class="-my-3 divide-y divide-base-300 text-sm">
      <div class="grid grid-cols-1 gap-1 p-2 sm:grid-cols-3 sm:gap-4">
        <dt class="font-medium">Published</dt>
        <dd class="sm:col-span-2 opacity-80">
          {new Date(date).toISOString().slice(0, 10)}
        </dd>
      </div>
      {#if updated}
        <div class="grid grid-cols-1 gap-1 p-2 sm:grid-cols-3 sm:gap-4">
          <dt class="font-medium">Updated</dt>
          <dd class="sm:col-span-2 opacity-80">
            {new Date(updated).toISOString().slice(0, 10)}
          </dd>
        </div>
      {/if}
      {#if categories}
        <div class="grid grid-cols-1 gap-1 p-2 sm:grid-cols-3 sm:gap-4">
          <dt class="font-medium">Posted in</dt>
          <dd class="sm:col-span-2">
            <ul class="flex gap-2 flex-wrap">
              {#each categories as category}
                <li>
                  <a class="badge badge-neutral" href="/blog/category/{category}/page/1">
                    {category}
                  </a>
                </li>
              {/each}
            </ul>
          </dd>
        </div>
      {/if}
    </dl>
  </aside>

  <div class="prose prose-lg w-full max-w-full">
    <svelte:component this={PostContent} />
  </div>
</article>
