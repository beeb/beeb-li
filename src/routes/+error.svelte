<script lang="ts">
  import { page } from '$app/stores'
</script>

<h2>{$page.status}</h2>
<p>{$page.error?.message || 'error'}</p>

<p><strong>Sorry!</strong> Something went wrong. Maybe try one of these links?</p>
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="/blog">Blog</a></li>
</ul>
