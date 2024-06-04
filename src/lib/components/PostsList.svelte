<script lang="ts">
  export let posts: PostData[] = [];
</script>

<ul class="flex flex-col gap-6">
  {#each posts as post}
    <li>
      <a href="/blog/{post.slug}">
        <article class="card md:card-side bg-base-200 shadow">
          {#if post.coverImage}
            <figure class="max-h-72 md:max-w-[50%]">
              <img src={post.coverImage} alt="" />
            </figure>
          {/if}
          <div class="card-body">
            <h2 class="card-title">{post.title}</h2>
            <p>{post.excerpt}</p>
          </div>
        </article>
      </a>
    </li>
  {/each}
</ul>
