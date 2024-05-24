<script lang="ts">
  export let posts: PostData[] = []
</script>

<ul class="posts-list">
  {#each posts as post}
    <li>
      <article>
        <a href="/blog/{post.slug}">
          <img src={post.coverImage} alt="" />
          <h2>
            {post.title}
          </h2>
        </a>
      </article>

      <p>{post.excerpt}</p>
    </li>
  {/each}
</ul>
