<script lang="ts">
  import { siteTitle } from "$lib/config";
  import type { PageData } from "./$types";

  export let data: PageData;

  const { title, excerpt, date, updated, coverImage, coverAlt, categories } =
    data.meta;
  const { PostContent } = data;
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
  {#if coverImage}
    <figure class="mb-8 flex justify-center">
      <img
        class="rounded-lg max-h-96 w-full object-cover"
        src={coverImage}
        alt={coverAlt ?? ""}
      />
    </figure>
  {/if}

  <h1 class="text-4xl font-bold mb-6">{title}</h1>

  <aside
    class="flow-root rounded-lg border border-gray-100 py-3 shadow-sm dark:border-gray-700 mb-8"
  >
    <dl class="-my-3 divide-y divide-gray-100 text-sm dark:divide-gray-700">
      <div class="grid grid-cols-1 gap-1 p-2 sm:grid-cols-3 sm:gap-4">
        <dt class="font-medium text-gray-900 dark:text-white">Published</dt>
        <dd class="text-gray-700 sm:col-span-2 dark:text-gray-200">
          {new Date(date).toLocaleDateString()}
        </dd>
      </div>
      {#if updated}
        <div class="grid grid-cols-1 gap-1 p-2 sm:grid-cols-3 sm:gap-4">
          <dt class="font-medium text-gray-900 dark:text-white">Updated</dt>
          <dd class="text-gray-700 sm:col-span-2 dark:text-gray-200">
            {new Date(updated).toLocaleDateString()}
          </dd>
        </div>
      {/if}
      {#if categories}
        <div class="grid grid-cols-1 gap-1 p-2 sm:grid-cols-3 sm:gap-4">
          <dt class="font-medium text-gray-900 dark:text-white">Posted in</dt>
          <dd class="text-gray-700 sm:col-span-2 dark:text-gray-200">
            <ul class="flex gap-2">
              {#each categories as category}
                <li>
                  <a
                    class="badge badge-neutral"
                    href="/blog/category/{category}/"
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
