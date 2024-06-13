<script lang="ts">
	import { navItems } from "$lib/config";
	import { page } from "$app/stores";
</script>

<ul {...$$props}>
	<li>
		<a href="/" class={($page.route.id ?? "") === "/" ? "active" : ""}>
			Home
		</a>
	</li>
	{#each navItems as p}
		<li>
			<a
				href={p.route}
				class={($page.route.id ?? "").startsWith(p.route) ? "active" : ""}
				>{p.title}</a
			>
		</li>
	{/each}
</ul>
