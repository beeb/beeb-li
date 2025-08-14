<script lang="ts">
interface Props {
	posts: PostData[]
}

const { posts = [] }: Props = $props()
</script>

<ul class="flex flex-col gap-6">
  {#each posts as post}
    <li>
      <article class="card md:card-side bg-base-200 shadow-sm">
        {#if post.coverImage}
          <figure class="max-h-72 md:max-h-none">
            <a
              href="/blog/{post.slug}"
              class="flex justify-center items-center"
            >
              <!-- TODO: fix sizes taking aspect ratio into account (cover) -->
              <enhanced:img
                src={post.enhancedImage}
                alt={post.coverAlt ?? ""}
                class="object-cover w-full h-full"
                sizes="
                  (min-width: 1024px) 415px,
                  (min-width: 768px) calc(33vw - 24px),
                  calc(100vw - 48px)
                "
              ></enhanced:img>
            </a>
          </figure>
        {/if}
        <div class="card-body md:basis-2/3">
          <a href="/blog/{post.slug}">
            <h2 class="card-title text-balance">{post.title}</h2>
          </a>
          <span class="text-sm opacity-80">
            {new Date(post.date).toISOString().slice(0, 10)}
          </span>
          <p class="text-justify">{post.excerpt}</p>
          <div class="card-actions justify-between items-end flex-nowrap">
            <div class="flex gap-2 flex-wrap">
              {#each post.categories as category}
                <a class="badge" href="/blog/category/{category}/page/1">
                  {category}
                </a>
              {/each}
            </div>
            <a class="btn btn-primary btn-outline" href="/blog/{post.slug}"
              >Read more</a
            >
          </div>
        </div>
      </article>
    </li>
  {/each}
</ul>

<style>
  :global(figure > a > picture) {
    width: 100%;
    height: 100%;
  }
</style>
