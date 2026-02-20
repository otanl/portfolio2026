<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		lang?: 'ja' | 'en';
		readOnly?: boolean;
	}

	let { lang = 'ja', readOnly = false }: Props = $props();

	let count = $state<number | null>(null);

	onMount(async () => {
		try {
			const response = await fetch('/api/counter', { method: readOnly ? 'GET' : 'POST' });
			if (response.ok) {
				const data = await response.json();
				count = data.count;
			}
		} catch (error) {
			console.error('Failed to fetch access count:', error);
		}
	});
</script>

<div class="my-4 flex items-baseline justify-center gap-2">
	<p>{lang === 'ja' ? 'あなたは' : 'You are visitor #'}</p>
	<p class="text-2xl font-bold">
		{count !== null ? count.toLocaleString() : '---'}
	</p>
	{#if lang === 'ja'}
		<p>人目のお客様です</p>
	{/if}
</div>
