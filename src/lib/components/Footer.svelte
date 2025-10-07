<script lang="ts">
  import { page } from '$app/state'
  import { siteAuthor } from '$lib/config'
  import Mastodon from 'virtual:icons/mingcute/mastodon-fill'
  import Github from 'virtual:icons/mingcute/github-fill'
  import Rss from 'virtual:icons/mingcute/rss-fill'
  import RssLine from 'virtual:icons/mingcute/rss-line'

  const counterUrl = $derived.by(() => {
    let url = new URL('count', 'https://goat.beeb.li')
    url.searchParams.set('p', page.url.pathname + page.url.search + page.url.hash)
    return url.toString()
  })
</script>

<footer class="text-center mt-8 pb-8">
  <p>
    <a class="btn text-lg btn-ghost" href="https://hachyderm.io/@beeb" rel="external">
      <Mastodon />
      Mastodon
    </a>
    <a class="btn text-lg btn-ghost" href="https://github.com/beeb" rel="external">
      <Github />
      Github
    </a>
    <a class="btn text-lg btn-ghost" href="/rss.xml" rel="alternate" data-sveltekit-reload>
      <Rss />
      RSS
    </a>
    <a class="btn text-lg btn-ghost" href="/index.xml" rel="alternate" data-sveltekit-reload>
      <RssLine />
      Atom
    </a>
  </p>
  <p>
    &copy; {new Date().getFullYear()}
    {siteAuthor}. No cookies are used by this website =)
    <noscript>
      <img alt="goat" src={counterUrl} />
    </noscript>
  </p>
</footer>
