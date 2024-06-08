<script lang="ts">
  import { siteAuthor } from "$lib/config";
  import Mastodon from "virtual:icons/mingcute/mastodon-fill";
  import Github from "virtual:icons/mingcute/github-fill";
  import Rss from "virtual:icons/mingcute/rss-fill";
</script>

<footer class="text-center mt-8 pb-8">
  <p>
    <a
      class="btn text-lg btn-ghost"
      href="https://hachyderm.io/@beeb"
      rel="external"
    >
      <Mastodon />
      Mastodon
    </a>
    <a
      class="btn text-lg btn-ghost"
      href="https://github.com/beeb"
      rel="external"
    >
      <Github />
      Github
    </a>
    <a class="btn text-lg btn-ghost" href="/rss.xml" rel="alternate">
      <Rss />
      RSS
    </a>
  </p>
  <p>&copy; {new Date().getFullYear()} {siteAuthor}</p>
</footer>
