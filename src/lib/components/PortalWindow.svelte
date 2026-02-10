<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		variant?: 'win95' | 'vista';
		initialX?: number;
		initialY?: number;
		initialW?: number;
		initialH?: number;
		zIndex?: number;
		onfocus?: () => void;
		onclose?: () => void;
		children?: Snippet;
	}

	let {
		title = 'modern.exe',
		variant = 'vista',
		initialX = 60,
		initialY = 200,
		initialW = 480,
		initialH = 400,
		zIndex = 40,
		onfocus,
		onclose,
		children,
	}: Props = $props();

	let x = $state(initialX);
	let y = $state(initialY);
	let w = $state(initialW);
	let h = $state(initialH);
	let visible = $state(true);
	let minimized = $state(false);
	let glassEffect = $state(false);
	let glitchEffect = $state(false);
	let maximized = $state(false);
	let preMaxRect = { x: 0, y: 0, w: 0, h: 0 };
	let preMaxScrollY = 0;

	// File → load images that bounce around the window (DVD screensaver style)
	type BouncingImage = { id: number; x: number; y: number; vx: number; vy: number; imgW: number; imgH: number; el: HTMLDivElement | null };
	const bouncingImages: BouncingImage[] = []; // non-reactive — DOM driven by RAF
	let bounceContainerEl: HTMLDivElement | undefined;
	let imageNextId = 0;
	let fileInput: HTMLInputElement | undefined;
	let bounceAnimId = 0;
	const BOUNCE_IMG_MAX = 120;

	function handleFileOpen() {
		fileInput?.click();
	}

	function handleFileSelected(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;
		for (const file of input.files) {
			if (!file.type.startsWith('image/')) continue;
			const reader = new FileReader();
			reader.onload = () => {
				const src = reader.result as string;
				const probe = new Image();
				probe.onload = () => {
					const scale = Math.min(BOUNCE_IMG_MAX / probe.naturalWidth, BOUNCE_IMG_MAX / probe.naturalHeight, 1);
					const imgW = Math.round(probe.naturalWidth * scale);
					const imgH = Math.round(probe.naturalHeight * scale);
					const angle = (30 + Math.random() * 30) * (Math.PI / 180);
					const speed = 1.5 + Math.random() * 1.5;
					const dirX = Math.random() > 0.5 ? 1 : -1;
					const dirY = Math.random() > 0.5 ? 1 : -1;
					const cw = contentEl?.clientWidth || 300;
					const ch = contentEl?.clientHeight || 200;
					const id = imageNextId++;

					// Create DOM element directly
					const wrapper = document.createElement('div');
					wrapper.className = 'bouncing-image';
					wrapper.style.width = imgW + 'px';
					wrapper.style.height = imgH + 'px';
					wrapper.onclick = (ev) => { ev.stopPropagation(); removeBounceImage(id); };
					const imgEl = document.createElement('img');
					imgEl.src = src;
					imgEl.alt = 'uploaded';
					imgEl.width = imgW;
					imgEl.height = imgH;
					wrapper.appendChild(imgEl);

					const startX = Math.random() * Math.max(0, cw - imgW);
					const startY = Math.random() * Math.max(0, ch - imgH);
					wrapper.style.left = startX + 'px';
					wrapper.style.top = startY + 'px';

					if (bounceContainerEl) bounceContainerEl.appendChild(wrapper);
					else contentEl?.appendChild(wrapper);

					bouncingImages.push({
						id, x: startX, y: startY,
						vx: Math.cos(angle) * speed * dirX,
						vy: Math.sin(angle) * speed * dirY,
						imgW, imgH, el: wrapper,
					});

					// Start RAF if first image
					if (bouncingImages.length === 1) startBounceLoop();
				};
				probe.src = src;
			};
			reader.readAsDataURL(file);
		}
		input.value = '';
	}

	function removeBounceImage(id: number) {
		const idx = bouncingImages.findIndex(b => b.id === id);
		if (idx !== -1) {
			bouncingImages[idx].el?.remove();
			bouncingImages.splice(idx, 1);
		}
		if (bouncingImages.length === 0 && bounceAnimId) {
			cancelAnimationFrame(bounceAnimId);
			bounceAnimId = 0;
		}
	}

	function startBounceLoop() {
		function tick() {
			if (!contentEl || bouncingImages.length === 0) { bounceAnimId = 0; return; }
			const cw = contentEl.clientWidth;
			const ch = contentEl.clientHeight;

			for (const b of bouncingImages) {
				b.x += b.vx;
				b.y += b.vy;
				if (b.x + b.imgW > cw) { b.x = cw - b.imgW; b.vx = -Math.abs(b.vx); }
				if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
				if (b.y + b.imgH > ch) { b.y = ch - b.imgH; b.vy = -Math.abs(b.vy); }
				if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
				if (b.el) { b.el.style.left = b.x + 'px'; b.el.style.top = b.y + 'px'; }
			}
			bounceAnimId = requestAnimationFrame(tick);
		}
		bounceAnimId = requestAnimationFrame(tick);
	}

	// Combined SVG filter for portal viewport
	let activeFilter = $derived.by(() => {
		const filters: string[] = [];
		if (glitchEffect) filters.push('url(#glitch-effect)');
		if (glassEffect) {
			filters.push('blur(1px)');
			filters.push('url(#glass-distortion-strong)');
		}
		return filters.join(' ');
	});

	// Interactive effect tracking (mouse → filter params)
	let prevMouseX = 0;
	let prevMouseY = 0;
	let contentMouseX = 0;
	let contentMouseY = 0;
	let mouseSpeed = 0;

	function handleContentMouseMove(e: MouseEvent) {
		if (!contentEl) return;
		const rect = contentEl.getBoundingClientRect();
		contentMouseX = e.clientX - rect.left;
		contentMouseY = e.clientY - rect.top;
		const dx = e.clientX - prevMouseX;
		const dy = e.clientY - prevMouseY;
		mouseSpeed = Math.sqrt(dx * dx + dy * dy);
		prevMouseX = e.clientX;
		prevMouseY = e.clientY;
	}

	function handleContentWheel(e: WheelEvent) {
		mouseSpeed += Math.abs(e.deltaY) * 0.3;
	}

	// RAF loop: glitch intensity driven by mouse velocity
	$effect(() => {
		if (!glitchEffect) return;

		let animId: number;
		let smoothScale = 5;
		let smoothRgb = 3;

		function tick() {
			const baseJitter = 3 + Math.random() * 4;
			const targetScale = baseJitter + Math.min(mouseSpeed * 2, 30);
			smoothScale += (targetScale - smoothScale) * 0.12;

			const targetRgb = 2 + Math.min(mouseSpeed * 0.8, 10);
			smoothRgb += (targetRgb - smoothRgb) * 0.12;

			mouseSpeed *= 0.92; // decay

			const dm = document.querySelector('#glitch-effect feDisplacementMap');
			if (dm) dm.setAttribute('scale', String(Math.round(smoothScale)));

			const ro = Math.round(smoothRgb);
			const rOff = document.querySelector('#glitch-effect feOffset[result="rOff"]');
			const bOff = document.querySelector('#glitch-effect feOffset[result="bOff"]');
			if (rOff) rOff.setAttribute('dx', String(-ro));
			if (bOff) bOff.setAttribute('dx', String(ro));

			animId = requestAnimationFrame(tick);
		}

		tick();
		return () => cancelAnimationFrame(animId);
	});

	// RAF loop: glass breathing + position-dependent distortion
	$effect(() => {
		if (!glassEffect) return;

		let animId: number;
		let phase = 0;

		function tick() {
			phase += 0.02;

			// Organic displacement: 3 layered sine waves (irrational ratios → long non-repeat cycle)
			const scale = 50
				+ Math.sin(phase * 0.7) * 10       // slow swell (~9s)
				+ Math.sin(phase * 1.87) * 6        // medium ripple (~3.4s)
				+ Math.sin(phase * 3.71) * 3;       // fast shimmer (~1.7s)
			const dm = document.querySelector('#glass-distortion-strong feDisplacementMap');
			if (dm) dm.setAttribute('scale', String(Math.round(scale)));

			// Noise map drift: position-based + time-based (distortion pattern evolves)
			const noiseOff = document.querySelector('#glass-distortion-strong feOffset[result="shiftedMap"]');
			if (noiseOff) {
				const driftX = Math.sin(phase * 0.31) * 25 + Math.cos(phase * 0.73) * 12;
				const driftY = Math.cos(phase * 0.43) * 18 + Math.sin(phase * 0.91) * 10;
				noiseOff.setAttribute('dx', String(Math.round(x * 0.1 + driftX)));
				noiseOff.setAttribute('dy', String(Math.round(y * 0.1 + driftY)));
			}

			// Organic chromatic aberration
			const chroma = 4
				+ Math.sin(phase * 1.13) * 2
				+ Math.sin(phase * 2.31) * 1;
			const glassR = document.querySelector('#glass-distortion-strong feOffset[result="rOff"]');
			const glassB = document.querySelector('#glass-distortion-strong feOffset[result="bOff"]');
			if (glassR) glassR.setAttribute('dx', String(-Math.round(chroma)));
			if (glassB) glassB.setAttribute('dx', String(Math.round(chroma)));

			animId = requestAnimationFrame(tick);
		}

		tick();
		return () => cancelAnimationFrame(animId);
	});

	function handleMaximize() {
		if (maximized) {
			x = preMaxRect.x;
			y = preMaxRect.y;
			w = preMaxRect.w;
			h = preMaxRect.h;
			maximized = false;
			if (contentEl) contentEl.scrollTop = 0;
			// Restore background page scroll
			window.scrollTo(0, preMaxScrollY);
		} else {
			preMaxRect = { x, y, w, h };
			preMaxScrollY = window.scrollY;
			const pad = variant === 'win95' ? 8 : 4;
			x = pad;
			y = MIN_Y + pad;
			w = window.innerWidth - pad * 2;
			h = window.innerHeight - MIN_Y - pad * 2;
			maximized = true;
			// Sync portal scroll to background page position
			requestAnimationFrame(() => {
				if (contentEl) contentEl.scrollTop = preMaxScrollY;
			});
		}
	}

	// Sync: portal scroll ↔ background page scroll while maximized
	$effect(() => {
		if (!maximized || !contentEl) return;
		const el = contentEl;
		function onPortalScroll() {
			window.scrollTo(0, el.scrollTop);
		}
		el.addEventListener('scroll', onPortalScroll, { passive: true });
		return () => el.removeEventListener('scroll', onPortalScroll);
	});

	// Help gimmick (BSOD / error cascade)
	let bsod = $state(false);
	let errorDialogs = $state<{ id: number; x: number; y: number; msg: string }[]>([]);
	let errorNextId = 0;

	const errorMessages = [
		'不正な処理が行われました',
		'このプログラムは応答していません',
		'エラーが発生しました',
		'問題が発生したため、終了します',
		'メモリが不足しています',
		'例外が発生しました',
		'ファイルが見つかりません',
		'アクセスが拒否されました',
	];

	function handleHelp() {
		if (variant === 'vista') {
			bsod = true;
			setTimeout(() => { bsod = false; }, 4000);
		} else {
			const count = 5 + Math.floor(Math.random() * 4);
			for (let i = 0; i < count; i++) {
				setTimeout(() => {
					errorDialogs.push({
						id: errorNextId++,
						x: x + 20 + i * 22,
						y: y + 40 + i * 22,
						msg: errorMessages[Math.floor(Math.random() * errorMessages.length)]
					});
				}, i * 80);
			}
		}
	}

	function dismissAllErrors() {
		errorDialogs = [];
	}

	let dragging = $state(false);
	let dragOffX = 0;
	let dragOffY = 0;
	let scrollY = $state(0);

	// Resize state
	type ResizeDir = '' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
	let resizing = $state<ResizeDir>('');
	let resizeStartX = 0;
	let resizeStartY = 0;
	let resizeStartRect = { x: 0, y: 0, w: 0, h: 0 };
	const MIN_W = 200;
	const MIN_H = 150;
	const MIN_Y = 48;

	let contentEl: HTMLDivElement | undefined;
	let chromeH = $state(0);
	let borderW = $derived(variant === 'win95' ? 6 : 4);

	onMount(() => {
		scrollY = window.scrollY;

		if (contentEl) {
			const winEl = contentEl.closest('.win-window');
			if (winEl) {
				chromeH = contentEl.getBoundingClientRect().top - winEl.getBoundingClientRect().top;
			}
		}

		const onMove = (cx: number, cy: number) => {
			if (dragging) {
				x = cx - dragOffX;
				y = Math.max(MIN_Y, cy - dragOffY);
			} else if (resizing) {
				const dx = cx - resizeStartX;
				const dy = cy - resizeStartY;
				const s = resizeStartRect;

				if (resizing.includes('e')) {
					w = Math.max(MIN_W, s.w + dx);
				}
				if (resizing.includes('w')) {
					const newW = Math.max(MIN_W, s.w - dx);
					x = s.x + s.w - newW;
					w = newW;
				}
				if (resizing.includes('s')) {
					h = Math.max(MIN_H, s.h + dy);
				}
				if (resizing.includes('n')) {
					const newH = Math.max(MIN_H, s.h - dy);
					const newY = s.y + s.h - newH;
					if (newY >= MIN_Y) {
						y = newY;
						h = newH;
					}
				}
			}
		};
		const onUp = () => { dragging = false; resizing = ''; };
		const onScroll = () => { scrollY = window.scrollY; };

		const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
		const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onUp);
		window.addEventListener('touchmove', onTouchMove, { passive: true });
		window.addEventListener('touchend', onUp);
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onUp);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onUp);
			window.removeEventListener('scroll', onScroll);
		};
	});

	function startDrag(e: MouseEvent) {
		dragging = true;
		dragOffX = e.clientX - x;
		dragOffY = e.clientY - y;
		e.preventDefault();
	}

	function startDragTouch(e: TouchEvent) {
		dragging = true;
		dragOffX = e.touches[0].clientX - x;
		dragOffY = e.touches[0].clientY - y;
	}

	function startResize(dir: ResizeDir, e: MouseEvent) {
		resizing = dir;
		resizeStartX = e.clientX;
		resizeStartY = e.clientY;
		resizeStartRect = { x, y, w, h };
		e.preventDefault();
	}

	function startResizeTouch(dir: ResizeDir, e: TouchEvent) {
		resizing = dir;
		resizeStartX = e.touches[0].clientX;
		resizeStartY = e.touches[0].clientY;
		resizeStartRect = { x, y, w, h };
	}

	let contentX = $derived(x + borderW);
	let contentY = $derived(y + chromeH);
</script>

{#if visible}
	{#if !minimized}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="win-window {variant}"
			style="left: {x}px; top: {y}px; width: {w}px; height: {h}px; z-index: {zIndex};"
			role="dialog"
			onmousedown={onfocus}
			ontouchstart={onfocus}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="win-titlebar" onmousedown={startDrag} ontouchstart={startDragTouch}>
				<div class="win-titlebar-icon"></div>
				<span class="win-titlebar-text">{title}</span>
				<div class="win-titlebar-buttons">
					<button class="win-btn" onclick={() => minimized = true}>&#x2500;</button>
					<button class="win-btn" onclick={handleMaximize}>&#9633;</button>
					<button class="win-btn win-btn-close" onclick={() => { visible = false; onclose?.(); }}>&times;</button>
				</div>
			</div>

			<div class="win-menubar">
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="win-menu-item" onclick={handleFileOpen}>File</span>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="win-menu-item" class:win-menu-active={glitchEffect} onclick={() => glitchEffect = !glitchEffect}>Edit</span>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="win-menu-item" class:win-menu-active={glassEffect} onclick={() => glassEffect = !glassEffect}>View</span>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="win-menu-item" onclick={handleHelp}>Help</span>
			</div>

			<!-- Hidden file input for File menu -->
			<input type="file" accept="image/*" multiple bind:this={fileInput} onchange={handleFileSelected} style="display:none" />

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="win-content" class:win-content-maximized={maximized} bind:this={contentEl} onmousemove={handleContentMouseMove} onwheel={handleContentWheel}>
				{#if children && chromeH > 0}
					<div
						class="portal-viewport portal-modern"
						class:portal-maximized={maximized}
						class:glitch-active={glitchEffect}
						style="
							{maximized ? '' : `left: ${-contentX}px; top: ${-(contentY + scrollY)}px; width: 100vw;`}
							{!maximized && activeFilter ? `filter: ${activeFilter};` : ''}
						"
					>
						{@render children()}
					</div>
				{/if}

				<!-- Bouncing images container (File menu / DVD screensaver) — children added via DOM -->
				<div bind:this={bounceContainerEl} class="bounce-container"></div>

				{#if bsod}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="bsod" onclick={() => bsod = false}>
						<div class="bsod-text">
							<p>A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>
							<br />
							<p>IRQL_NOT_LESS_OR_EQUAL</p>
							<br />
							<p>If this is the first time you've seen this Stop error screen, restart your computer. If this screen appears again, follow these steps:</p>
							<br />
							<p>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any Windows updates you might need.</p>
							<br />
							<p>Technical information:</p>
							<br />
							<p>*** STOP: 0x0000000A (0x0028C034, 0x00000002, 0x00000001, 0x804E3B03)</p>
							<br />
							<p class="bsod-small">Beginning dump of physical memory...</p>
							<p class="bsod-small">Physical memory dump complete.</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Resize handles -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-n" onmousedown={(e) => startResize('n', e)} ontouchstart={(e) => startResizeTouch('n', e)}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-s" onmousedown={(e) => startResize('s', e)} ontouchstart={(e) => startResizeTouch('s', e)}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-e" onmousedown={(e) => startResize('e', e)} ontouchstart={(e) => startResizeTouch('e', e)}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-w" onmousedown={(e) => startResize('w', e)} ontouchstart={(e) => startResizeTouch('w', e)}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-nw" onmousedown={(e) => startResize('nw', e)} ontouchstart={(e) => startResizeTouch('nw', e)}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-ne" onmousedown={(e) => startResize('ne', e)} ontouchstart={(e) => startResizeTouch('ne', e)}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-sw" onmousedown={(e) => startResize('sw', e)} ontouchstart={(e) => startResizeTouch('sw', e)}></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="resize-handle resize-se" onmousedown={(e) => startResize('se', e)} ontouchstart={(e) => startResizeTouch('se', e)}></div>
		</div>
	{:else}
		<button class="win-taskbar-btn {variant}" onclick={() => minimized = false}>
			<div class="win-taskbar-icon"></div>
			<span>{title}</span>
		</button>
	{/if}
{/if}

<!-- Error dialog cascade (Help gimmick for win95) -->
{#each errorDialogs as dlg (dlg.id)}
	<div class="error-dialog" style="left: {dlg.x}px; top: {dlg.y}px; z-index: {zIndex + 100};">
		<div class="error-dialog-titlebar">
			<span>エラー</span>
			<button class="error-dialog-close" onclick={dismissAllErrors}>&times;</button>
		</div>
		<div class="error-dialog-body">
			<span class="error-dialog-icon">&#x26A0;</span>
			<p>{dlg.msg}</p>
		</div>
		<div class="error-dialog-buttons">
			<button class="error-dialog-ok" onclick={dismissAllErrors}>OK</button>
		</div>
	</div>
{/each}

<style>
	/* ===== Shared ===== */
	.win-window {
		position: fixed;
		display: flex;
		flex-direction: column;
	}
	.win-titlebar {
		display: flex;
		align-items: center;
		cursor: grab;
		user-select: none;
		touch-action: none;
	}
	.win-titlebar:active { cursor: grabbing; }
	.win-titlebar-text { flex: 1; }
	.win-titlebar-buttons { display: flex; }
	.win-btn { display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
	.win-content { flex: 1; overflow: hidden; position: relative; }
	.win-content-maximized { overflow-y: auto; }
	.portal-viewport { position: absolute; pointer-events: auto; font-size: 16px; }
	.portal-maximized { position: relative; width: 100%; }
	.resize-handle { position: absolute; z-index: 10; }
	.resize-n  { top: -3px; left: 8px; right: 8px; height: 6px; cursor: n-resize; }
	.resize-s  { bottom: -3px; left: 8px; right: 8px; height: 6px; cursor: s-resize; }
	.resize-e  { right: -3px; top: 8px; bottom: 8px; width: 6px; cursor: e-resize; }
	.resize-w  { left: -3px; top: 8px; bottom: 8px; width: 6px; cursor: w-resize; }
	.resize-nw { top: -3px; left: -3px; width: 12px; height: 12px; cursor: nw-resize; }
	.resize-ne { top: -3px; right: -3px; width: 12px; height: 12px; cursor: ne-resize; }
	.resize-sw { bottom: -3px; left: -3px; width: 12px; height: 12px; cursor: sw-resize; }
	.resize-se { bottom: -3px; right: -3px; width: 12px; height: 12px; cursor: se-resize; }

	/* ===== Windows 95 (neumorphism palette) ===== */
	.win-window.win95 {
		background: #d6d3d9;
		border: 2px solid;
		border-color: #f0edf3 #3a383e #3a383e #f0edf3;
		box-shadow: 1px 0 0 #1c1b1f, 0 1px 0 #1c1b1f, 1px 1px 0 #1c1b1f, inset 1px 1px 0 #f0edf3;
		font-family: 'MS Sans Serif', 'MS UI Gothic', Tahoma, sans-serif;
		font-size: 12px;
	}
	:global(.dark) .win-window.win95 {
		background: #38363c;
		border-color: #4a484e #1e1c22 #1e1c22 #4a484e;
		box-shadow: 1px 0 0 #111, 0 1px 0 #111, 1px 1px 0 #111, inset 1px 1px 0 #4a484e;
	}

	.win95 .win-titlebar {
		gap: 3px;
		padding: 2px 2px 2px 3px;
		background: linear-gradient(90deg, #8b3a16, #e85d2a);
		color: #f0edf3;
		font-weight: bold;
		font-size: 11px;
		letter-spacing: 0.3px;
	}
	:global(.dark) .win95 .win-titlebar {
		background: linear-gradient(90deg, #5c2610, #a3411d);
	}

	.win95 .win-titlebar-icon {
		width: 14px; height: 14px;
		background: linear-gradient(135deg, #c8cc00, #e2ff00);
		transform: rotate(45deg);
		border: 1px solid rgba(255,255,255,0.5);
		flex-shrink: 0;
		margin: 0 2px;
	}
	:global(.dark) .win95 .win-titlebar-icon {
		background: linear-gradient(135deg, #8a8e00, #b8cc00);
	}

	.win95 .win-titlebar-buttons { gap: 2px; }

	.win95 .win-btn {
		width: 16px; height: 14px;
		font-size: 11px; line-height: 1;
		background: #d6d3d9;
		border: 1px solid;
		border-color: #f0edf3 #3a383e #3a383e #f0edf3;
		color: #1c1b1f;
	}
	.win95 .win-btn:active { border-color: #3a383e #f0edf3 #f0edf3 #3a383e; }
	.win95 .win-btn-close { font-size: 13px; font-weight: bold; }

	.win95 .win-menubar {
		display: flex;
		padding: 0 1px;
		background: #d6d3d9;
		border-bottom: 1px solid #c4c1c7;
	}
	:global(.dark) .win95 .win-menubar {
		background: #38363c;
		border-bottom-color: #4a484e;
	}
	.win95 .win-menu-item {
		padding: 2px 6px;
		cursor: default;
		color: #1c1b1f;
	}
	:global(.dark) .win95 .win-menu-item { color: #e6e1e5; }
	.win95 .win-menu-item:hover { background: #2d2b31; color: #f0edf3; }

	.win95 .win-content {
		margin: 2px;
		border: 2px solid;
		border-color: #c4c1c7 #f0edf3 #f0edf3 #c4c1c7;
	}
	:global(.dark) .win95 .win-content {
		border-color: #1e1c22 #4a484e #4a484e #1e1c22;
	}

	/* Win95 Taskbar */
	.win-taskbar-btn.win95 {
		position: fixed; bottom: 4px; left: 4px; z-index: 40;
		display: flex; align-items: center; gap: 4px;
		padding: 2px 10px 2px 4px;
		background: #d6d3d9;
		border: 2px solid;
		border-color: #f0edf3 #3a383e #3a383e #f0edf3;
		font-family: 'MS Sans Serif', 'MS UI Gothic', Tahoma, sans-serif;
		font-size: 11px;
		cursor: pointer; color: #1c1b1f;
		box-shadow: inset 1px 1px 0 #f0edf3;
	}
	:global(.dark) .win-taskbar-btn.win95 { background: #38363c; border-color: #4a484e #1e1c22 #1e1c22 #4a484e; color: #e6e1e5; }
	.win-taskbar-btn.win95:active { border-color: #3a383e #f0edf3 #f0edf3 #3a383e; box-shadow: inset 1px 1px 0 #c4c1c7; }

	.win95 .win-taskbar-icon,
	.win-taskbar-btn.win95 .win-taskbar-icon {
		width: 12px; height: 12px;
		background: linear-gradient(135deg, #c8cc00, #e2ff00);
		transform: rotate(45deg);
		border: 1px solid rgba(255,255,255,0.5);
	}
	:global(.dark) .win95 .win-taskbar-icon,
	:global(.dark) .win-taskbar-btn.win95 .win-taskbar-icon {
		background: linear-gradient(135deg, #8a8e00, #b8cc00);
	}

	/* ===== Windows Vista Aero Glass (site palette) ===== */
	.win-window.vista {
		background: rgba(214, 211, 217, 0.45);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(196, 193, 199, 0.5);
		border-radius: 8px 8px 4px 4px;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.28),
			0 0 1px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.35);
		font-family: 'Segoe UI', 'Yu Gothic UI', Tahoma, sans-serif;
		font-size: 12px;
		overflow: hidden;
	}
	:global(.dark) .win-window.vista {
		background: rgba(45, 43, 49, 0.6);
		border-color: rgba(72, 70, 73, 0.4);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.5),
			0 0 1px rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.vista .win-titlebar {
		gap: 6px;
		height: 30px;
		padding: 0 4px 0 8px;
		background: linear-gradient(180deg, rgba(240,128,80,0.6) 0%, rgba(232,93,42,0.5) 50%, rgba(220,85,35,0.55) 100%);
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		color: #fff;
		font-size: 12px;
		font-weight: normal;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
	}
	:global(.dark) .vista .win-titlebar {
		background: linear-gradient(180deg, rgba(200,70,25,0.55) 0%, rgba(180,60,20,0.45) 50%, rgba(170,55,18,0.5) 100%);
		border-bottom-color: rgba(255, 255, 255, 0.08);
	}

	.vista .win-titlebar-icon {
		width: 16px; height: 16px;
		background: linear-gradient(135deg, #c8cc00, #e2ff00);
		border-radius: 3px;
		border: 1px solid rgba(255, 255, 255, 0.4);
		flex-shrink: 0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}
	:global(.dark) .vista .win-titlebar-icon {
		background: linear-gradient(135deg, #8a8e00, #b8cc00);
	}

	.vista .win-titlebar-buttons { gap: 2px; }

	.vista .win-btn {
		width: 28px; height: 18px;
		font-size: 12px; line-height: 1;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		transition: background 0.15s;
	}
	.vista .win-btn:hover { background: rgba(255, 255, 255, 0.28); }
	.vista .win-btn:active { background: rgba(0, 0, 0, 0.15); }
	.vista .win-btn-close { font-size: 15px; }
	.vista .win-btn-close:hover { background: rgba(220, 50, 50, 0.85); border-color: rgba(180, 30, 30, 0.7); }
	.vista .win-btn-close:active { background: rgba(180, 30, 30, 0.9); }

	.vista .win-menubar {
		display: flex;
		padding: 0 3px; margin: 0 3px;
		background: rgba(232, 93, 42, 0.12);
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}
	:global(.dark) .vista .win-menubar {
		background: rgba(180, 60, 20, 0.1);
		border-bottom-color: rgba(255, 255, 255, 0.06);
	}
	.vista .win-menu-item {
		padding: 3px 8px;
		cursor: default;
		color: rgba(0, 0, 0, 0.7);
		font-size: 11px;
		border-radius: 2px;
		transition: background 0.1s;
	}
	:global(.dark) .vista .win-menu-item { color: rgba(255, 255, 255, 0.7); }
	.vista .win-menu-item:hover { background: rgba(232, 93, 42, 0.3); color: #fff; }

	.vista .win-content {
		margin: 0 3px 3px 3px;
		border: none;
		border-radius: 0 0 3px 3px;
	}

	/* Vista Taskbar */
	.win-taskbar-btn.vista {
		position: fixed; bottom: 6px; left: 6px; z-index: 40;
		display: flex; align-items: center; gap: 6px;
		padding: 4px 12px 4px 6px;
		background: rgba(214, 211, 217, 0.5);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(196, 193, 199, 0.4);
		border-radius: 4px;
		font-family: 'Segoe UI', 'Yu Gothic UI', Tahoma, sans-serif;
		font-size: 11px;
		cursor: pointer; color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: background 0.15s;
	}
	:global(.dark) .win-taskbar-btn.vista { background: rgba(45, 43, 49, 0.65); border-color: rgba(72, 70, 73, 0.4); color: #ddd; }
	.win-taskbar-btn.vista:hover { background: rgba(240, 237, 243, 0.6); }
	:global(.dark) .win-taskbar-btn.vista:hover { background: rgba(58, 56, 62, 0.7); }

	.vista .win-taskbar-icon,
	.win-taskbar-btn.vista .win-taskbar-icon {
		width: 14px; height: 14px;
		background: linear-gradient(135deg, #c8cc00, #e2ff00);
		border-radius: 3px;
		border: 1px solid rgba(255, 255, 255, 0.4);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}
	:global(.dark) .vista .win-taskbar-icon,
	:global(.dark) .win-taskbar-btn.vista .win-taskbar-icon {
		background: linear-gradient(135deg, #8a8e00, #b8cc00);
	}

	/* ===== Glitch jitter animation ===== */
	.glitch-active {
		animation: glitch-jitter 0.15s steps(2) infinite;
	}
	@keyframes glitch-jitter {
		0%, 100% { transform: translate(0) skewX(0); }
		14% { transform: translate(-2px, 1px) skewX(0.3deg); }
		28% { transform: translate(1px, 0) skewX(-0.2deg); }
		42% { transform: translate(-1px, 0) skewX(0); }
		57% { transform: translate(2px, 0) skewX(-0.2deg); }
		71% { transform: translate(0, -1px) skewX(0.1deg); }
		85% { transform: translate(1px, 0) skewX(0); }
	}

	/* ===== Menu active state (checked) ===== */
	.win-menu-active {
		background: rgba(45, 43, 49, 0.2);
	}
	.vista .win-menu-active {
		background: rgba(232, 93, 42, 0.25);
	}
	.win-menu-active::before {
		content: '✓ ';
	}

	/* ===== Bouncing images (DVD screensaver) ===== */
	.bounce-container {
		position: absolute;
		inset: 0;
		z-index: 10;
		pointer-events: none;
		overflow: hidden;
	}
	.bounce-container :global(.bouncing-image) {
		position: absolute;
		cursor: pointer;
		pointer-events: auto;
	}
	.bounce-container :global(.bouncing-image img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
		filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.4));
	}

	/* ===== BSOD ===== */
	.bsod {
		position: absolute;
		inset: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		animation: bsod-in 0.15s ease-out;
		background: #000080;
		color: #c0c0c0;
		font-family: 'Lucida Console', 'Courier New', monospace;
		font-size: 11px;
		padding: 16px;
		overflow: hidden;
	}
	@keyframes bsod-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	.bsod .bsod-text {
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-all;
	}
	.bsod .bsod-text p { margin: 0; }
	.bsod-small { opacity: 0.6; }

	/* ===== Error Dialogs ===== */
	.error-dialog {
		position: fixed;
		width: 280px;
		background: #d6d3d9;
		border: 2px solid;
		border-color: #f0edf3 #3a383e #3a383e #f0edf3;
		box-shadow: 2px 2px 0 #1c1b1f;
		font-family: 'MS Sans Serif', 'MS UI Gothic', Tahoma, sans-serif;
		font-size: 12px;
		animation: error-pop 0.12s ease-out;
	}
	:global(.dark) .error-dialog {
		background: #38363c;
		border-color: #4a484e #1e1c22 #1e1c22 #4a484e;
		box-shadow: 2px 2px 0 #111;
		color: #e6e1e5;
	}
	@keyframes error-pop {
		from { transform: scale(0.8); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}
	.error-dialog-titlebar {
		display: flex; align-items: center; justify-content: space-between;
		padding: 2px 2px 2px 4px;
		background: linear-gradient(90deg, #8b3a16, #e85d2a);
		color: #f0edf3; font-weight: bold; font-size: 11px;
	}
	:global(.dark) .error-dialog-titlebar {
		background: linear-gradient(90deg, #5c2610, #a3411d);
	}
	.error-dialog-close {
		width: 16px; height: 14px; font-size: 13px; line-height: 1;
		background: #d6d3d9; border: 1px solid;
		border-color: #f0edf3 #3a383e #3a383e #f0edf3;
		color: #1c1b1f; cursor: pointer;
		display: flex; align-items: center; justify-content: center; padding: 0;
	}
	.error-dialog-body {
		display: flex; align-items: flex-start; gap: 10px; padding: 14px 12px 8px;
	}
	.error-dialog-icon { font-size: 28px; line-height: 1; flex-shrink: 0; }
	.error-dialog-body p { margin: 0; padding-top: 4px; line-height: 1.4; }
	.error-dialog-buttons { text-align: center; padding: 4px 12px 10px; }
	.error-dialog-ok {
		padding: 2px 24px; background: #d6d3d9; border: 2px solid;
		border-color: #f0edf3 #3a383e #3a383e #f0edf3;
		cursor: pointer; font-size: 12px; font-family: inherit;
	}
	:global(.dark) .error-dialog-ok {
		background: #38363c; border-color: #4a484e #1e1c22 #1e1c22 #4a484e; color: #e6e1e5;
	}
	.error-dialog-ok:active { border-color: #3a383e #f0edf3 #f0edf3 #3a383e; }

</style>
