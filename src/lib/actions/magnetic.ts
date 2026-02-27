import type { Action } from 'svelte/action';

interface MagneticOptions {
	selector?: string;
	radius?: number;       // effect radius beyond element bounds (px)
	maxTranslate?: number; // max movement (px)
	disabled?: boolean;
}

export const magneticContainer: Action<HTMLElement, MagneticOptions | undefined> = (node, options) => {
	let opts = { selector: '.button-3d', radius: 30, maxTranslate: 5, disabled: false, ...options };

	if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return {};
	}

	let activeChild: HTMLElement | null = null;
	let rafId = 0;

	function handleMouseMove(e: MouseEvent) {
		if (opts.disabled) return;

		const children = node.querySelectorAll<HTMLElement>(opts.selector);
		let closest: HTMLElement | null = null;
		let closestDx = 0;
		let closestDy = 0;
		let closestDist = Infinity;

		for (const child of children) {
			const rect = child.getBoundingClientRect();
			const cx = rect.left + rect.width / 2;
			const cy = rect.top + rect.height / 2;
			const dx = e.clientX - cx;
			const dy = e.clientY - cy;
			const halfW = rect.width / 2 + opts.radius;
			const halfH = rect.height / 2 + opts.radius;

			if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) {
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < closestDist) {
					closestDist = dist;
					closest = child;
					closestDx = dx;
					closestDy = dy;
				}
			}
		}

		if (closest !== activeChild && activeChild) {
			resetChild(activeChild);
		}
		activeChild = closest;

		if (closest) {
			const rect = closest.getBoundingClientRect();
			const halfW = rect.width / 2 + opts.radius;
			const halfH = rect.height / 2 + opts.radius;
			const tx = (closestDx / halfW) * opts.maxTranslate;
			const ty = (closestDy / halfH) * opts.maxTranslate;

			if (rafId) cancelAnimationFrame(rafId);
			const target = closest;
			rafId = requestAnimationFrame(() => {
				target.style.transition = 'transform 0.15s ease-out';
				target.style.transform = `translate(${tx}px, ${ty}px)`;
				rafId = 0;
			});
		}
	}

	function resetChild(child: HTMLElement) {
		child.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
		child.style.transform = '';
	}

	function handleMouseLeave() {
		if (activeChild) {
			resetChild(activeChild);
			activeChild = null;
		}
	}

	node.addEventListener('mousemove', handleMouseMove);
	node.addEventListener('mouseleave', handleMouseLeave);

	return {
		update(newOptions) {
			opts = { selector: '.button-3d', radius: 30, maxTranslate: 5, disabled: false, ...newOptions };
		},
		destroy() {
			if (rafId) cancelAnimationFrame(rafId);
			node.removeEventListener('mousemove', handleMouseMove);
			node.removeEventListener('mouseleave', handleMouseLeave);
			if (activeChild) {
				activeChild.style.transform = '';
				activeChild.style.transition = '';
			}
		}
	};
};
