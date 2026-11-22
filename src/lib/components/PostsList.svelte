<script lang="ts">
	interface Props {
		posts: PostData[]
	}

	const { posts = [] }: Props = $props()
</script>

<ul class="flex flex-col gap-6">
	{#each posts as post}
		<li>
			<article class="card md:card-side bg-base-200 shadow-sm">
				{#if post.coverImage}
					<figure class="max-h-72 md:max-h-none">
						<!-- biome-ignore lint/a11y/useAnchorContent: aria-label names the link -->
						<a href="/blog/{post.slug}" class="flex items-center justify-center" aria-label={post.title}>
							<!-- TODO: fix sizes taking aspect ratio into account (cover) -->
							<enhanced:img
								src={post.enhancedImage}
								alt={post.coverAlt ?? ''}
								class="h-full w-full object-cover"
								sizes="
                  (min-width: 1024px) 415px,
                  (min-width: 768px) calc(33vw - 24px),
                  calc(100vw - 48px)
                "
							></enhanced:img>
						</a>
					</figure>
				{/if}
				<div class="card-body md:basis-2/3">
					<a href="/blog/{post.slug}">
						<h2 class="card-title text-balance">{post.title}</h2>
					</a>
					<span class="text-sm opacity-80">
						{new Date(post.date).toISOString().slice(0, 10)}
					</span>
					<p class="text-justify">{post.excerpt}</p>
					<div class="card-actions flex-nowrap items-end justify-between">
						<div class="flex flex-wrap gap-2">
							{#each post.categories as category}
								<a class="badge" href="/blog/category/{category}/page/1">
									{category}
								</a>
							{/each}
						</div>
						<a class="btn btn-primary btn-outline" href="/blog/{post.slug}">Read more</a>
					</div>
				</div>
			</article>
		</li>
	{/each}
</ul>

<style>
	:global(figure > a > picture) {
		width: 100%;
		height: 100%;
	}
</style>
