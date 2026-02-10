<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	interface Props {
		text: string;
		fontPath?: string;
		follower?: boolean;
	}

	let { text, fontPath = '/fonts/GenEi POPle Black_Regular.json', follower = false }: Props = $props();

	let container: HTMLDivElement;
	let containerHeight = $state(300);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentRect.width;
				containerHeight = w < 500 ? 180 : w < 700 ? 220 : 300;
			}
		});
		observer.observe(container);

		return () => observer.disconnect();
	});
</script>

<div bind:this={container} class="word-art-container" style="height: {containerHeight}px;">
	{#if browser && mounted}
		{#await import('./WordArt3DScene.svelte') then { default: WordArt3DScene }}
			<WordArt3DScene {text} {fontPath} {follower} />
		{/await}
	{/if}
</div>

<style>
	.word-art-container {
		width: 100%;
	}
</style>
