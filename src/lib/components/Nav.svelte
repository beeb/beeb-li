<script lang="ts">
	import { navItems } from "$lib/config";
	import { page } from "$app/stores";

	export let cl: string;
</script>

<ul class={cl}>
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
