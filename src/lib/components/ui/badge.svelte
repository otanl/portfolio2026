<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { tv, type VariantProps } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
				secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
				outline: 'text-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

	export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
		variant?: BadgeVariant;
		class?: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	import { cn } from '$lib/utils';

	let { variant = 'default', class: className, children, ...restProps }: BadgeProps = $props();
</script>

<div class={cn(badgeVariants({ variant }), className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
