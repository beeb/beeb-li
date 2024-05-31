<script lang="ts">
	import { navItems } from "$lib/config";
	import { currentPage } from "$lib/assets/store";

	export let cl: string;
	export let tabindex: number | undefined = undefined;
</script>

<ul class={cl} {tabindex}>
	{#each navItems as page}
		<li>
			<a href={page.route} class={$currentPage === page.route ? "active" : ""}
				>{page.title}</a
			>
		</li>
	{/each}
</ul>
