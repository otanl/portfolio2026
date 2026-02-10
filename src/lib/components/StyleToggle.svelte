<script lang="ts">
	import { onMount } from 'svelte';
	import { Monitor, Palette } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';

	let style = $state<'retro' | 'modern'>('retro');

	onMount(() => {
		const saved = localStorage.getItem('designStyle');
		if (saved === 'modern' || saved === 'retro') {
			style = saved;
		}
		updateStyle();
	});

	function updateStyle() {
		if (style === 'modern') {
			document.documentElement.classList.add('modern');
		} else {
			document.documentElement.classList.remove('modern');
		}
		localStorage.setItem('designStyle', style);
	}

	function toggleStyle() {
		style = style === 'retro' ? 'modern' : 'retro';
		updateStyle();
	}
</script>

<Button variant="ghost" size="icon" onclick={toggleStyle} title={style === 'retro' ? 'Switch to Modern' : 'Switch to Retro'}>
	{#if style === 'retro'}
		<Monitor class="h-[1.2rem] w-[1.2rem]" />
	{:else}
		<Palette class="h-[1.2rem] w-[1.2rem]" />
	{/if}
	<span class="sr-only">Toggle design style</span>
</Button>
