<script lang="ts">
	import { siteAuthor } from '#lib/config.js'
	import Mastodon from 'virtual:icons/mingcute/mastodon-fill'
	import Github from 'virtual:icons/mingcute/github-fill'
	import Rss from 'virtual:icons/mingcute/rss-fill'
	import RssLine from 'virtual:icons/mingcute/rss-line'
</script>

<footer class="mt-8 pb-8 text-center">
	<p>
		<a class="btn btn-ghost text-lg" href="https://hachyderm.io/@beeb" rel="external">
			<Mastodon />
			Mastodon
		</a>
		<a class="btn btn-ghost text-lg" href="https://github.com/beeb" rel="external">
			<Github />
			Github
		</a>
		<a class="btn btn-ghost text-lg" href="/rss.xml" rel="alternate" data-sveltekit-reload>
			<Rss />
			RSS
		</a>
		<a class="btn btn-ghost text-lg" href="/index.xml" rel="alternate" data-sveltekit-reload>
			<RssLine />
			Atom
		</a>
	</p>
	<p>
		&copy; {new Date().getFullYear()}
		{siteAuthor}. No cookies are used by this website =)
	</p>
</footer>
