<script lang="ts">
  import { page } from '$app/state'
</script>

<div class="flex justify-center">
  <div class="prose prose-xl max-w-none">
    <h2>{page.status}</h2>
    <code>{page.error?.message || 'error'}</code>

    <p><strong>Sorry!</strong> Something went wrong. Maybe try one of these links?</p>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/blog">Blog</a></li>
    </ul>
  </div>
</div>
