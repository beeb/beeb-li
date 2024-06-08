<script lang="ts">
	import { navItems } from "$lib/config";
	import { page } from "$app/stores";
</script>

<ul {...$$props}>
	{#each navItems as p}
		<li>
			<a
				href={p.route}
				class={($page.route.id ?? "").startsWith(p.route) ? "active" : ""}
				>{p.title}</a
			>
		</li>
	{/each}
	<li>
		<a href="/rss.xml" rel="alternate">RSS</a>
	</li>
</ul>
