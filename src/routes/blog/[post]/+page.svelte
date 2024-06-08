<script lang="ts">
  import { siteTitle } from "$lib/config";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: ({ title, excerpt, date, updated, coverAlt, categories, enhancedImage } =
    data.meta);
  $: ({ PostContent } = data);
</script>

<svelte:head>
  <title>{siteTitle} - {title}</title>
  <meta data-key="description" name="description" content={excerpt} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta name="twitter:title" content={title} />
  <meta property="og:description" content={excerpt} />
  <meta name="twitter:description" content={excerpt} />
  <!-- TODO: generate automatically? -->
  <!-- <meta property="og:image" content="https://yourdomain.com/image_path" /> -->
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <!-- <meta name="twitter:image" content="https://yourdomain.com/image_path" /> -->
</svelte:head>

<article>
  {#if enhancedImage}
    <figure
      class="mb-8 flex justify-center items-center max-h-96 overflow-hidden rounded-lg"
    >
      <enhanced:img
        class="object-cover"
        src={enhancedImage}
        alt={coverAlt ?? ""}
        sizes="
          (min-width: 1024px) 976px,
          calc(100vw - 48px)
        "
      />
    </figure>
  {/if}

  <div class="prose mb-8">
    <h1>{title}</h1>
  </div>

  <aside
    class="flow-root rounded-lg border border-base-300 py-3 shadow mb-8 max-w-lg"
  >
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
            <ul class="flex gap-2">
              {#each categories as category}
                <li>
                  <a
                    class="badge badge-neutral"
                    href="/blog/category/{category}/page/1"
                  >
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

  <div class="prose w-full max-w-full">
    <svelte:component this={PostContent} />
  </div>
</article>
