<script lang="ts">
  export let posts: PostData[] = []
</script>

<ul>
  {#each posts as post}
    <li>
      <article>
        <a href="/blog/{post.slug}">
          {#if post.coverImage}
            <img src={post.coverImage} alt="" />
          {/if}
          <h2>
            {post.title}
          </h2>
        </a>
      </article>

      <p>{post.excerpt}</p>
    </li>
  {/each}
</ul>
