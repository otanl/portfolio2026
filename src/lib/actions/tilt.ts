import type { Action } from 'svelte/action';

interface TiltOptions {
	maxDeg?: number;
	perspective?: number;
	disabled?: boolean;
}

export const tilt: Action<HTMLElement, TiltOptions | undefined> = (node, options) => {
	let opts = { maxDeg: 5, perspective: 800, disabled: false, ...options };

	if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return {};
	}

	function handleMouseMove(e: MouseEvent) {
		if (opts.disabled) return;

		const rect = node.getBoundingClientRect();
		const cx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
		const cy = (e.clientY - rect.top) / rect.height - 0.5;

		const rotateX = -cy * opts.maxDeg * 2; // negative so card tilts toward cursor
		const rotateY = cx * opts.maxDeg * 2;

		node.style.transition = 'transform 0.1s ease-out';
		node.style.transform = `perspective(${opts.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		node.style.willChange = 'transform';
	}

	function handleMouseLeave() {
		node.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
		node.style.transform = '';
		// Clean up will-change after transition
		setTimeout(() => { node.style.willChange = ''; }, 400);
	}

	node.addEventListener('mousemove', handleMouseMove);
	node.addEventListener('mouseleave', handleMouseLeave);

	return {
		update(newOptions) {
			opts = { maxDeg: 5, perspective: 800, disabled: false, ...newOptions };
			if (opts.disabled) {
				node.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
				node.style.transform = '';
			}
		},
		destroy() {
			node.removeEventListener('mousemove', handleMouseMove);
			node.removeEventListener('mouseleave', handleMouseLeave);
			node.style.transform = '';
			node.style.willChange = '';
		}
	};
};
