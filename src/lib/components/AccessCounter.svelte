<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		readOnly?: boolean;
	}

	let { readOnly = false }: Props = $props();

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
	<p>あなたは</p>
	<p class="text-2xl font-bold">
		{count !== null ? count.toLocaleString() : '---'}
	</p>
	<p>人目のお客様です</p>
</div>
