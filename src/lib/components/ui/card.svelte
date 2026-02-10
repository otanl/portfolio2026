<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface CardProps extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className, children, ...restProps }: CardProps = $props();
</script>

<div class={cn('bg-card text-card-foreground shadow', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
