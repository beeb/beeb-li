<script lang="ts">
  import { siteAuthor } from "$lib/config";
</script>

<footer>
  <nav>
    <ul>
      <li>
        <a href="/rss.xml" data-sveltekit-reload>RSS</a>
      </li>
      <li>
        <a href="/">Home</a>
      </li>
    </ul>
  </nav>

  <p>&copy; {new Date().getFullYear()} {siteAuthor}</p>
</footer>
