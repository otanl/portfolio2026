<script lang="ts">
	import { onMount } from 'svelte';
	import { Sun, Moon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		const isDark =
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
		theme = isDark ? 'dark' : 'light';
		updateTheme();
	});

	function updateTheme() {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		updateTheme();
	}
</script>

<Button variant="ghost" size="icon" onclick={toggleTheme}>
	<Sun
		class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
	/>
	<Moon
		class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
