<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardTitle, Badge } from '$lib/components/ui';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { cn, getLowResUrl, parseMarkdownLinks, getYouTubeEmbedUrl } from '$lib/utils';
	import type { Project } from '$lib/types';
	import { slide, fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { projectSelection } from '$lib/stores/portal';

	interface Props {
		projects: Project[];
		showHeading?: boolean;
	}

	let { projects, showHeading = true }: Props = $props();

	// Use shared store so retro and portal instances stay in sync
	let selectedId = $derived($projectSelection.selectedId);
	let currentSlideIndex = $derived($projectSelection.currentSlideIndex);

	type CarouselItem = { type: 'image' | 'embed' | 'video'; src: string };

	function toggleProject(slug: string) {
		projectSelection.update(s => {
			const newId = s.selectedId === slug ? null : slug;
			const idx = { ...s.currentSlideIndex };
			if (!idx[slug]) idx[slug] = 0;
			return { selectedId: newId, currentSlideIndex: idx };
		});
	}

	function nextSlide(e: Event, slug: string, total: number) {
		e.stopPropagation();
		projectSelection.update(s => {
			const idx = { ...s.currentSlideIndex };
			idx[slug] = ((idx[slug] || 0) + 1) % total;
			return { ...s, currentSlideIndex: idx };
		});
	}

	function prevSlide(e: Event, slug: string, total: number) {
		e.stopPropagation();
		projectSelection.update(s => {
			const idx = { ...s.currentSlideIndex };
			idx[slug] = ((idx[slug] || 0) - 1 + total) % total;
			return { ...s, currentSlideIndex: idx };
		});
	}

	function getCarouselItems(project: Project): CarouselItem[] {
		const items: CarouselItem[] = [];

		for (const img of project.images) {
			if (img) items.push({ type: 'image', src: img });
		}

		if (project.embed) {
			items.push({ type: 'embed', src: project.embed });
		}

		if (project.videos) {
			for (const video of project.videos) {
				const embedUrl = getYouTubeEmbedUrl(video);
				if (embedUrl) items.push({ type: 'video', src: embedUrl });
			}
		}

		return items;
	}
</script>

<section id="projects" class="py-20">
	{#if showHeading}
		<h2 class="mb-12 text-center text-4xl font-bold">Projects</h2>
	{/if}
	<div class="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each projects as project (project.slug)}
			{@const isSelected = selectedId === project.slug}
			{@const carouselItems = getCarouselItems(project)}
			{@const slideIndex = currentSlideIndex[project.slug] || 0}
			{@const currentItem = carouselItems[slideIndex]}
			<button
				type="button"
				onclick={() => toggleProject(project.slug)}
				class={cn(
					'group cursor-pointer text-left transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
					isSelected ? 'md:col-span-2 lg:col-span-3' : 'col-span-1'
				)}
			>
				<Card class={cn(
					'retro-card project-card h-full overflow-hidden rounded-none transition-shadow duration-500',
					isSelected && 'shadow-[6px_6px_0_#1c1b1f] dark:shadow-[6px_6px_0_#4a484e]'
				)}>
					<!-- メディアエリア -->
					<div class="relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" style="height: {isSelected ? 'auto' : '200px'};">
						{#if carouselItems.length > 0}
							{#if isSelected}
								<div class="relative">
									{#key slideIndex}
										<div in:fade={{ duration: 250 }}>
											{#if currentItem.type === 'image'}
												<img
													src={currentItem.src}
													alt={project.title}
													class="expanded h-auto max-h-[600px] w-full object-contain"
												/>
											{:else if currentItem.type === 'embed'}
												<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
												<div class="w-full" onclick={(e) => e.stopPropagation()}>
													<iframe
														src={currentItem.src}
														class="aspect-[1/0.7073] w-full border-2 border-black"
														allowfullscreen
														title={project.title}
													></iframe>
												</div>
											{:else if currentItem.type === 'video'}
												<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
												<div class="w-full" onclick={(e) => e.stopPropagation()}>
													<iframe
														src={currentItem.src}
														class="aspect-video w-full border-2 border-black"
														allowfullscreen
														title={project.title}
													></iframe>
												</div>
											{/if}
										</div>
									{/key}

									{#if carouselItems.length > 1}
										<div class="absolute inset-x-0 bottom-4 flex items-center justify-center gap-4" transition:fade={{ duration: 200 }}>
											<button
												type="button"
												onclick={(e) => prevSlide(e, project.slug, carouselItems.length)}
												class="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
											>
												<ChevronLeft size={24} />
											</button>
											<span class="rounded bg-black/50 px-2 py-1 text-sm text-white backdrop-blur-sm">
												{slideIndex + 1} / {carouselItems.length}
											</span>
											<button
												type="button"
												onclick={(e) => nextSlide(e, project.slug, carouselItems.length)}
												class="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
											>
												<ChevronRight size={24} />
											</button>
										</div>
									{/if}
								</div>
							{:else}
								{@const firstImage = carouselItems.find(item => item.type === 'image')}
								{@const previewSrc = firstImage?.src || project.thumbnail}
								{#if previewSrc}
									<img
										src={getLowResUrl(previewSrc)}
										alt={project.title}
										class="h-full w-full object-cover grayscale-[25%] blur-[0.5px] brightness-75 transition-all duration-500 group-hover:scale-105 group-hover:grayscale group-hover:contrast-[800%] group-hover:brightness-75"
									/>
								{:else}
									<div class="flex h-full items-center justify-center bg-gray-200">
										<span class="text-gray-500">No Preview</span>
									</div>
								{/if}
							{/if}
						{:else}
							<div class="flex h-full items-center justify-center bg-gray-200">
								<span class="text-gray-500">No Image</span>
							</div>
						{/if}
					</div>

					<!-- タイトル・説明 -->
					<CardContent class="pt-6">
						<CardTitle class="retro-text">{project.title}</CardTitle>
						<CardDescription class="mt-2">{project.description}</CardDescription>
					</CardContent>

					<!-- 展開コンテンツ -->
					{#if isSelected}
						<div transition:slide={{ duration: 400, easing: cubicOut }}>
							<CardFooter class="flex-col items-start">
								<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
								<div
									class="prose prose-sm mt-2 max-w-none"
									onclick={(e) => e.stopPropagation()}
									in:fade={{ duration: 300, delay: 150 }}
								>
									{@html parseMarkdownLinks(project.content)}
								</div>
								<div class="mt-4 flex flex-wrap gap-2">
									{#each project.technologies as tech, i}
										<div in:fly={{ y: 10, duration: 250, delay: 200 + i * 50, easing: cubicOut }}>
											<Badge variant="secondary" class="retro-text">{tech}</Badge>
										</div>
									{/each}
								</div>
							</CardFooter>
						</div>
					{/if}
				</Card>
			</button>
		{/each}
	</div>
</section>
