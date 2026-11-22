<script lang="ts">
	import { type TocNode, toc_tree } from '@mdsvex/plugin-toc'
	import type { PluginDataContext } from 'mdsvex/compile'
	import { getContext, type Snippet } from 'svelte'

	const { children: _, ...rest }: { children?: Snippet; [attr: string]: unknown } = $props()

	const data = getContext<PluginDataContext | undefined>(Symbol.for('mdsvex.plugin_data'))
	const tree = $derived(toc_tree(data?.current?.toc?.headings ?? []))
	const parts = $derived(new Map((data?.current?.tocParts?.headings ?? []).map((h) => [h.id, h.parts])))
</script>

{#snippet list(nodes: TocNode[])}
	<ul>
		{#each nodes as node (node)}
			<li>
				<a href="#{node.id}"
					>{#each parts.get(node.id) ?? [{ code: false, text: node.text }] as p}
						{#if p.code}
							<code>{p.text}</code>
						{:else}
							{p.text}
						{/if}
					{/each}</a
				>
				{#if node.children.length > 0}
					{@render list(node.children)}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{#if tree.length > 0}
	<nav {...rest} class="toc">{@render list(tree)}</nav>
{/if}
