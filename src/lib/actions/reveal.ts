import type { Action } from 'svelte/action';

interface RevealOptions {
	threshold?: number;
	stagger?: number; // ms delay between children with [data-reveal-child]
}

export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options) => {
	const opts = { threshold: 0.1, stagger: 60, ...options };

	// Reduced motion: show immediately
	if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return {};
	}

	// Portal viewport: absolute positioning breaks IntersectionObserver — skip
	if (node.closest('.portal-viewport')) {
		return {};
	}

	node.classList.add('reveal-hidden');

	const children = node.querySelectorAll<HTMLElement>('[data-reveal-child]');

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.remove('reveal-hidden');
					node.classList.add('reveal-visible');

					// Stagger children with [data-reveal-child]
					children.forEach((child, i) => {
						child.style.transitionDelay = `${i * opts.stagger}ms`;
					});
				} else if (node.classList.contains('reveal-visible')) {
					node.classList.remove('reveal-visible');
					node.classList.add('reveal-hidden');

					// Reset stagger delays for uniform hide
					children.forEach((child) => {
						child.style.transitionDelay = '';
					});
				}
			}
		},
		{ threshold: opts.threshold }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
