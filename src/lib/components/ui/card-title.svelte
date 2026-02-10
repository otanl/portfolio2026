<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
		class?: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className, children, ...restProps }: CardTitleProps = $props();
</script>

<h3 class={cn('font-semibold leading-none tracking-tight', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</h3>
