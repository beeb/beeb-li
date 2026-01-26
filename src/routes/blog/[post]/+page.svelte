<script lang="ts">
  import { mount } from 'svelte'
  import { siteTitle } from '$lib/config'
  import CopyButton from '$lib/components/CopyButton.svelte'
  import type { Attachment } from 'svelte/attachments'

  const { data } = $props()

  const ogDate = $derived((data.meta.updated ? new Date(data.meta.updated) : new Date(data.meta.date)).toISOString())

  const copyButtonAttachment: Attachment = (element) => {
    for (const node of element.querySelectorAll('pre.shiki')) {
      const wrapper = document.createElement('div')
      wrapper.className = 'relative'
      node.parentNode?.insertBefore(wrapper, node)
      wrapper.appendChild(node)
      const smallPre = (node as HTMLPreElement).offsetHeight < 90

      mount(CopyButton, {
        target: wrapper,
        props: {
          content: node.textContent ?? '',
          class: `absolute ${smallPre ? 'top-2 right-16' : 'top-4 right-4'} btn-outline btn-square text-base-content!`, // requires <pre> to have position: relative;
        },
      })
    }
  }
</script>

<svelte:head>
  <title>{siteTitle} - {data.meta.title}</title>
  <meta data-key="description" name="description" content={data.meta.excerpt} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={data.meta.title} />
  <meta name="twitter:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.excerpt} />
  <meta name="twitter:description" content={data.meta.excerpt} />
  <meta property="og:image" content={`${data.baseUrl}/blog/${data.meta.slug}/og.png?modified=${ogDate}`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="twitter:image" content={`${data.baseUrl}/blog/${data.meta.slug}/og.png?modified=${ogDate}`} />
  {#if data.meta.categories}
    {#each data.meta.categories as category}
      <meta name="article:tag" content={category} />
    {/each}
  {/if}
  <meta property="article:published_time" content={data.meta.date} />
</svelte:head>

<article {@attach copyButtonAttachment} data-pagefind-body>
  {#if data.meta.enhancedImage}
    <div class="mb-8 flex flex-col items-end gap-1">
      <figure
        class="flex justify-center items-center max-h-96 overflow-hidden rounded-box"
        aria-describedby="cover-image-credits"
      >
        <enhanced:img
          class="object-cover"
          src={data.meta.enhancedImage}
          alt={data.meta.coverAlt ?? ''}
          sizes="
          (min-width: 1024px) 976px,
          calc(100vw - 48px)
        "
        ></enhanced:img>
      </figure>
      {#if data.meta.coverCredits}
        <cite id="cover-image-credits" class="opacity-80">
          {data.meta.coverCredits}
        </cite>
      {/if}
    </div>
  {/if}

  <div class="prose sm:prose-lg max-w-none mb-8">
    <h1 class="text-balance">{data.meta.title}</h1>
  </div>

  <aside class="mb-8 flex flex-wrap gap-4 justify-between items-center text-sm">
    <dl class="flex gap-6 flex-wrap">
      <div class="flex gap-2">
        <dt class="font-medium">Published</dt>
        <dd class="sm:col-span-2 opacity-80">
          {new Date(data.meta.date).toISOString().slice(0, 10)}
        </dd>
      </div>
      {#if data.meta.updated}
        <div class="flex gap-2">
          <dt class="font-medium">Updated</dt>
          <dd class="sm:col-span-2 opacity-80">
            {new Date(data.meta.updated).toISOString().slice(0, 10)}
          </dd>
        </div>
      {/if}
    </dl>
    <figure class="flex gap-2 items-center">
      {#if data.meta.categories}
        <figcaption class="font-medium shrink-0">Posted in</figcaption>
        <ul class="flex gap-2 flex-wrap">
          {#each data.meta.categories as category}
            <li>
              <a class="badge" href="/blog/category/{category}/page/1">
                {category}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </figure>
  </aside>

  <div class="prose prose-lg max-w-none prose-p:text-justify prose-headings:text-balance">
    <data.PostContent />
  </div>
</article>
