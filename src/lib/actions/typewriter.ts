import type { Action } from 'svelte/action';

export const typewriter: Action<HTMLElement, string | undefined> = (node, text) => {
	if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return {};
	}

	// Skip in portal — text already visible on the main page
	if (node.closest('.portal-viewport')) {
		return {};
	}

	const fullText = text || node.textContent || '';
	node.textContent = '';
	node.style.minHeight = '1.5em';

	let i = 0;
	let timerId = 0;

	const type = () => {
		node.textContent = fullText.slice(0, ++i);
		if (i < fullText.length) {
			timerId = window.setTimeout(type, 40);
		}
	};

	timerId = window.setTimeout(type, 500);

	return {
		update(newText) {
			// On lang change: stop animation, show full new text immediately
			clearTimeout(timerId);
			node.textContent = newText || '';
		},
		destroy() {
			clearTimeout(timerId);
		}
	};
};
