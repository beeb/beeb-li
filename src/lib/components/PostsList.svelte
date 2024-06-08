<script lang="ts">
  export let posts: PostData[] = [];
</script>

<ul class="flex flex-col gap-6">
  {#each posts as post}
    <li>
      <article class="card md:card-side bg-base-200 shadow">
        {#if post.coverImage}
          <figure class="max-h-72 md:max-w-[50%]">
            <a href="/blog/{post.slug}">
              <enhanced:img
                src={post.enhancedImage}
                alt={post.coverAlt ?? ""}
              />
            </a>
          </figure>
        {/if}
        <div class="card-body">
          <a href="/blog/{post.slug}">
            <h2 class="card-title">{post.title}</h2>
          </a>
          <span class="text-sm opacity-80">
            {new Date(post.date).toLocaleDateString()}
          </span>
          <p>{post.excerpt}</p>
          <div class="card-actions justify-between items-end">
            <div class="flex gap-2">
              {#each post.categories as category}
                <a
                  class="badge badge-neutral"
                  href="/blog/category/{category}/"
                >
                  {category}
                </a>
              {/each}
            </div>
            <a class="btn btn-neutral" href="/blog/{post.slug}">Read more</a>
          </div>
        </div>
      </article>
    </li>
  {/each}
</ul>
