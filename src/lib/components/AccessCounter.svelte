<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		lang?: 'ja' | 'en';
		readOnly?: boolean;
	}

	let { lang = 'ja', readOnly = false }: Props = $props();

	let count = $state<number | null>(null);
	let displayCount = $state(0);

	function animateCount(target: number) {
		if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			displayCount = target;
			return;
		}

		const duration = 1500;
		const start = performance.now();

		function tick(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			displayCount = Math.round(eased * target);
			if (progress < 1) requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	onMount(async () => {
		try {
			const response = await fetch('/api/counter', { method: readOnly ? 'GET' : 'POST' });
			if (response.ok) {
				const data = await response.json();
				count = data.count;
				animateCount(data.count);
			}
		} catch (error) {
			console.error('Failed to fetch access count:', error);
		}
	});
</script>

<div class="my-4 flex items-baseline justify-center gap-2">
	<p>{lang === 'ja' ? 'あなたは' : 'You are visitor #'}</p>
	<p class="text-2xl font-bold tabular-nums">
		{count !== null ? displayCount.toLocaleString() : '---'}
	</p>
	{#if lang === 'ja'}
		<p>人目のお客様です</p>
	{/if}
</div>
