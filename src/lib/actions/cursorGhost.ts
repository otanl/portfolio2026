import type { Action } from 'svelte/action';

/**
 * Classic Windows cursor-trail bug recreation.
 * Leaves ghost cursor images behind when mouse moves fast.
 */
export const cursorGhost: Action<HTMLElement> = (node) => {
	// Skip in modern mode, reduced-motion, portal, or touch devices
	if (
		typeof window === 'undefined' ||
		window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
		document.documentElement.classList.contains('modern') ||
		node.closest('.portal-viewport')
	) {
		return {};
	}

	const SPEED_THRESHOLD = 1200; // px/s — only real fast flicks
	const DROP_INTERVAL = 8; // px — drop a ghost every 8px along the path
	const MAX_GHOSTS = 80;
	const GHOST_LIFETIME = 3000; // ms before fade-out starts
	const FADE_DURATION = 1000; // ms fade-out

	let lastX = 0;
	let lastY = 0;
	let lastTime = 0;
	let trailing = false; // currently in a fast-move streak
	let ghostCount = 0;
	let insideWinContent = false; // avoid closest() on every mousemove

	// Detect which cursor to ghost (arrow vs pointer)
	function getCursorType(target: EventTarget | null): 'default' | 'pointer' {
		if (!target || !(target instanceof HTMLElement)) return 'default';
		return target.closest('a, button, [role="button"], .button-3d') ? 'pointer' : 'default';
	}

	function createGhost(x: number, y: number, type: 'default' | 'pointer') {
		if (ghostCount >= MAX_GHOSTS) return;

		const ghost = document.createElement('div');
		ghost.className = 'cursor-ghost';
		ghost.setAttribute('data-cursor-type', type);
		ghost.style.left = `${x}px`;
		ghost.style.top = `${y}px`;

		document.body.appendChild(ghost);
		ghostCount++;

		setTimeout(() => {
			ghost.classList.add('cursor-ghost-fade');
			setTimeout(() => {
				ghost.remove();
				ghostCount--;
			}, FADE_DURATION);
		}, GHOST_LIFETIME);
	}

	function onMouseMove(e: MouseEvent) {
		if (insideWinContent) return;

		const now = performance.now();
		const dt = now - lastTime;

		if (dt > 0 && lastTime > 0) {
			const dx = e.clientX - lastX;
			const dy = e.clientY - lastY;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const speed = (dist / dt) * 1000;

			if (speed > SPEED_THRESHOLD) {
				trailing = true;
			} else if (speed < SPEED_THRESHOLD * 0.4) {
				trailing = false;
			}

			if (trailing && dist > 0) {
				const cursorType = getCursorType(e.target);
				const scrollX = window.scrollX;
				const scrollY = window.scrollY;
				const steps = Math.floor(dist / DROP_INTERVAL);
				for (let s = 1; s <= steps; s++) {
					const t = s / steps;
					createGhost(lastX + dx * t + scrollX, lastY + dy * t + scrollY, cursorType);
				}
			}
		}

		lastX = e.clientX;
		lastY = e.clientY;
		lastTime = now;
	}

	// Track .win-content enter/leave instead of calling closest() per mousemove
	function onMouseOver(e: MouseEvent) {
		if ((e.target as HTMLElement)?.closest?.('.win-content')) {
			insideWinContent = true;
		}
	}
	function onMouseOut(e: MouseEvent) {
		if (insideWinContent && (e.target as HTMLElement)?.closest?.('.win-content')) {
			insideWinContent = false;
		}
	}

	window.addEventListener('mousemove', onMouseMove, { passive: true });
	document.addEventListener('mouseover', onMouseOver, { passive: true });
	document.addEventListener('mouseout', onMouseOut, { passive: true });

	return {
		destroy() {
			window.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseover', onMouseOver);
			document.removeEventListener('mouseout', onMouseOut);
			document.querySelectorAll('.cursor-ghost').forEach((el) => el.remove());
		}
	};
};
