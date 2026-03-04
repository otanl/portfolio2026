<script lang="ts">
	import { onMount } from 'svelte';
	import { cssEditorState, styleSwapped } from '$lib/stores/portal';
	import { lighten, darken, contrastText } from '$lib/utils';
	import { X } from 'lucide-svelte';

	// Inject CSS via DOM so it appears after all stylesheets (beats @layer)
	let styleEl: HTMLStyleElement | null = null;
	onMount(() => {
		styleEl = document.createElement('style');
		styleEl.id = 'portal-user-css';
		document.body.appendChild(styleEl);
		// Apply any existing CSS
		const unsub2 = cssEditorState.subscribe((s) => {
			if (styleEl) styleEl.textContent = s.css;
		});
		return () => {
			unsub2();
			styleEl?.remove();
			styleEl = null;
		};
	});

	let x = $state(60);
	let y = $state(80);
	let z = $state(9000);
	let dragging = false;
	let dragOffX = 0;
	let dragOffY = 0;

	let tab = $state<'visual' | 'source'>('visual');
	let rawCss = $state('');

	// --- Visual properties ---
	let bgColor = $state('');
	let cardBgColor = $state('');
	let textColor = $state('');
	let accentColor = $state('');
	let linkColor = $state('');
	let borderColor = $state('');

	let fontFamily = $state('');
	let fontSize = $state(16);
	let fontSizeEnabled = $state(false);
	let letterSpacing = $state(0);
	let letterSpacingEnabled = $state(false);
	let lineHeight = $state(1.6);
	let lineHeightEnabled = $state(false);

	let borderRadius = $state(0);
	let borderRadiusEnabled = $state(false);
	let cardGap = $state(32);
	let cardGapEnabled = $state(false);
	let shadowSize = $state(6);
	let shadowSizeEnabled = $state(false);

	let invert = $state(false);
	let grayscale = $state(false);
	let hueRotate = $state(0);
	let hueRotateEnabled = $state(false);

	const DEFAULT_BG = '#dcd9de';

	function buildCss(): string {
		const S = '.portal-viewport';
		const allRules: string[] = [];
		const vpRules: string[] = [];
		const filters: string[] = [];

		// CSS variable overrides
		const vars: string[] = [];
		if (bgColor) vars.push(`--background: ${bgColor}`);
		if (cardBgColor) vars.push(`--card: ${cardBgColor}`);
		if (textColor) {
			vars.push(`--foreground: ${textColor}`);
			vars.push(`--card-foreground: ${textColor}`);
		}
		if (accentColor) {
			vars.push(`--accent: ${accentColor}`);
			vars.push(`--secondary: ${accentColor}`);
			vars.push(`--secondary-foreground: ${contrastText(accentColor)}`);
			vars.push(`--primary: ${accentColor}`);
			vars.push(`--primary-foreground: ${contrastText(accentColor)}`);
			vars.push(`--ring: ${accentColor}`);
		}
		if (borderColor) {
			vars.push(`--border: ${borderColor}`);
			vars.push(`--input: ${borderColor}`);
		}

		if (bgColor) vpRules.push(`background-color: ${bgColor} !important`);

		// Typography
		if (fontSizeEnabled) vpRules.push(`font-size: ${fontSize}px !important`);
		if (letterSpacingEnabled) vpRules.push(`letter-spacing: ${letterSpacing}px !important`);
		if (lineHeightEnabled) vpRules.push(`line-height: ${lineHeight} !important`);

		const combined = [...vars, ...vpRules];
		if (combined.length) {
			allRules.push(`${S} {\n  ${combined.join(';\n  ')};\n}`);
		}

		if (textColor) {
			// Exclude elements with Tailwind text-*-foreground classes (e.g. badges)
			// so that --secondary-foreground / --primary-foreground CSS vars take effect
			allRules.push(`${S}, ${S} *:not([class*="text-secondary-foreground"]):not([class*="text-primary-foreground"]) {\n  color: ${textColor} !important;\n}`);
		}

		// Card bg
		if (cardBgColor) {
			allRules.push(`${S} .retro-card,\n${S} [class*="card"] {\n  background-color: ${cardBgColor} !important;\n}`);
		}

		// Shadows — style depends on whether portal is in retro or neumorphic mode
		const isRetro = $styleSwapped;
		const hasAnyChange = bgColor || cardBgColor || textColor || accentColor || linkColor || borderColor || fontFamily || fontSizeEnabled || shadowSizeEnabled;
		if (hasAnyChange) {
			const surfaceColor = bgColor || DEFAULT_BG;
			const cardColor = cardBgColor || bgColor || DEFAULT_BG;
			const ss = shadowSizeEnabled ? shadowSize : 6;

			if (isRetro) {
				// Retro: flat drop shadow + outset border style
				const shadow = `${ss}px ${ss}px 0 rgba(0,0,0,0.25)`;
				const shadowSm = `${Math.max(1, Math.round(ss / 2))}px ${Math.max(1, Math.round(ss / 2))}px 0 rgba(0,0,0,0.2)`;
				const bdr = borderColor || darken(surfaceColor, 0.3);

				allRules.push(`${S} .retro-card {\n  border: 2px outset ${bdr} !important;\n  box-shadow: ${shadow} !important;\n  background: ${cardColor} !important;\n}`);
				allRules.push(`${S} .project-card:active {\n  box-shadow: inset 2px 2px 0 rgba(0,0,0,0.2) !important;\n  border-style: inset !important;\n}`);
				allRules.push(`${S} .button-3d {\n  background: ${cardColor} !important;\n  color: ${textColor || 'inherit'} !important;\n  border: 2px outset ${bdr} !important;\n  box-shadow: ${shadowSm} !important;\n}`);
				allRules.push(`${S} .retro-image {\n  box-shadow: ${shadowSm} !important;\n}`);
				allRules.push(`${S} .under-construction {\n  background: ${surfaceColor} !important;\n  border: 2px outset ${bdr} !important;\n  box-shadow: ${shadow} !important;\n  color: ${textColor || '#666'} !important;\n}`);
			} else {
				// Neumorphic: soft dual-light shadows
				const ssHalf = Math.max(1, Math.round(ss / 2));
				const ssBlur = ss * 2;
				const ssBlurHalf = Math.max(1, Math.round(ssBlur / 2));
				const sBtn = Math.round(ss * 0.67);
				const sBtnBlur = Math.round(ssBlur * 0.67);

				const bgDark = darken(surfaceColor, 0.18);
				const bgLight = lighten(surfaceColor, 0.45);
				const neuShadow = `${ss}px ${ss}px ${ssBlur}px ${bgDark}, -${ss}px -${ss}px ${ssBlur}px ${bgLight}`;
				const neuShadowSm = `${ssHalf}px ${ssHalf}px ${ssBlurHalf}px ${bgDark}, -${ssHalf}px -${ssHalf}px ${ssBlurHalf}px ${bgLight}`;
				const neuShadowBtn = `${sBtn}px ${sBtn}px ${sBtnBlur}px ${bgDark}, -${sBtn}px -${sBtn}px ${sBtnBlur}px ${bgLight}, inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.05)`;

				const cardDark = darken(cardColor, 0.18);
				const cardLight = lighten(cardColor, 0.45);
				const neuShadowInset = `inset ${ssHalf}px ${ssHalf}px ${ssBlurHalf}px ${cardDark}, inset -${ssHalf}px -${ssHalf}px ${ssBlurHalf}px ${cardLight}`;

				allRules.push(`${S} .site-main {\n  overflow: visible !important;\n}`);
				allRules.push(`${S} .retro-card {\n  border-color: transparent !important;\n  box-shadow: ${neuShadow} !important;\n}`);
				allRules.push(`${S} .project-card:active {\n  box-shadow: ${neuShadowInset} !important;\n}`);
				allRules.push(`${S} .button-3d {\n  background: ${cardColor} !important;\n  color: ${textColor || 'inherit'} !important;\n  border-color: transparent !important;\n  box-shadow: ${neuShadowBtn} !important;\n}`);
				allRules.push(`${S} .retro-image {\n  box-shadow: ${neuShadowSm} !important;\n}`);
				allRules.push(`${S} .retro-text {\n  text-shadow: none !important;\n}`);
				allRules.push(`${S} .under-construction {\n  background: ${surfaceColor} !important;\n  border-color: transparent !important;\n  box-shadow: ${neuShadow} !important;\n  color: ${textColor || '#666'} !important;\n  text-shadow: none !important;\n}`);
			}
		}

		// Card gap — override Tailwind gap via custom property + margin fallback
		if (cardGapEnabled) {
			allRules.push(`${S} #projects .grid {\n  --tw-gap-x: ${cardGap}px !important;\n  --tw-gap-y: ${cardGap}px !important;\n  gap: ${cardGap}px !important;\n  column-gap: ${cardGap}px !important;\n  row-gap: ${cardGap}px !important;\n}`);
		}

		// Border radius
		if (borderRadiusEnabled) {
			allRules.push(`${S} .retro-card,\n${S} [class*="card"],\n${S} .button-3d,\n${S} img {\n  border-radius: ${borderRadius}px !important;\n}`);
		}

		// Input/textarea — match card color
		{
			const inputBg = cardBgColor || bgColor;
			if (inputBg) {
				if (isRetro) {
					allRules.push(`${S} input,\n${S} textarea,\n${S} select {\n  background: ${inputBg} !important;\n  color: ${textColor || 'inherit'} !important;\n  border: 2px inset ${darken(inputBg, 0.2)} !important;\n}`);
				} else {
					const inputShadow = `inset 2px 2px 4px ${darken(inputBg, 0.15)}, inset -2px -2px 4px ${lighten(inputBg, 0.4)}`;
					allRules.push(`${S} input,\n${S} textarea,\n${S} select {\n  background: ${inputBg} !important;\n  color: ${textColor || 'inherit'} !important;\n  border-color: transparent !important;\n  box-shadow: ${inputShadow} !important;\n}`);
				}
			}
		}

		if (linkColor) {
			allRules.push(`${S} a {\n  color: ${linkColor} !important;\n}`);
		}

		if (fontFamily) {
			allRules.push(`${S}, ${S} * {\n  font-family: ${fontFamily} !important;\n}`);
		}

		if (accentColor) {
			allRules.push(`${S} a.star-marker {\n  color: ${accentColor} !important;\n}`);
		}

		// Filters
		if (invert) filters.push('invert(1)');
		if (grayscale) filters.push('grayscale(1)');
		if (hueRotateEnabled && hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);

		if (filters.length) {
			allRules.push(`${S} {\n  filter: ${filters.join(' ')} !important;\n}`);
		}

		return allRules.join('\n');
	}

	function applyVisual() {
		const generated = buildCss();
		rawCss = generated;
		cssEditorState.update((s) => ({ ...s, css: generated }));
	}

	// Re-apply CSS when style swap changes (retro ↔ neumorphic)
	let prevSwapped: boolean | undefined;
	$effect(() => {
		const swapped = $styleSwapped;
		if (prevSwapped !== undefined && prevSwapped !== swapped) {
			applyVisual();
		}
		prevSwapped = swapped;
	});

	function applyRaw() {
		cssEditorState.update((s) => ({ ...s, css: rawCss }));
	}

	function close() {
		cssEditorState.update((s) => ({ ...s, open: false }));
	}

	function reset() {
		bgColor = '';
		cardBgColor = '';
		textColor = '';
		accentColor = '';
		linkColor = '';
		borderColor = '';
		fontFamily = '';
		fontSize = 16;
		fontSizeEnabled = false;
		letterSpacing = 0;
		letterSpacingEnabled = false;
		lineHeight = 1.6;
		lineHeightEnabled = false;
		borderRadius = 0;
		borderRadiusEnabled = false;
		cardGap = 32;
		cardGapEnabled = false;
		shadowSize = 6;
		shadowSizeEnabled = false;
		invert = false;
		grayscale = false;
		hueRotate = 0;
		hueRotateEnabled = false;
		rawCss = '';
		cssEditorState.update((s) => ({ ...s, css: '' }));
	}

	// Dragging
	function onTitleDown(e: MouseEvent) {
		dragging = true;
		dragOffX = e.clientX - x;
		dragOffY = e.clientY - y;
		z = 9001;
		window.addEventListener('mousemove', onDrag);
		window.addEventListener('mouseup', onDragEnd);
	}
	function onDrag(e: MouseEvent) {
		if (!dragging) return;
		x = e.clientX - dragOffX;
		y = e.clientY - dragOffY;
	}
	function onDragEnd() {
		dragging = false;
		window.removeEventListener('mousemove', onDrag);
		window.removeEventListener('mouseup', onDragEnd);
	}

	// Font loading: Google Fonts are loaded on demand
	const loadedFonts = new Set<string>();
	function loadGoogleFont(id: string) {
		if (loadedFonts.has(id)) return;
		loadedFonts.add(id);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = `https://fonts.googleapis.com/css2?family=${id}&display=swap`;
		document.head.appendChild(link);
	}

	type FontEntry = { label: string; value: string; googleId?: string };
	const fonts: FontEntry[] = [
		{ label: 'Default', value: '' },
		{ label: 'Dela Gothic One', value: '"Dela Gothic One", sans-serif', googleId: 'Dela+Gothic+One' },
		{ label: 'DotGothic16', value: '"DotGothic16", sans-serif', googleId: 'DotGothic16' },
		{ label: 'Shippori Mincho', value: '"Shippori Mincho", serif', googleId: 'Shippori+Mincho:wght@400;700' },
		{ label: 'Noto Serif JP', value: '"Noto Serif JP", serif', googleId: 'Noto+Serif+JP:wght@400;700' },
		{ label: 'Zen Maru Gothic', value: '"Zen Maru Gothic", sans-serif', googleId: 'Zen+Maru+Gothic:wght@400;700' },
		{ label: 'M PLUS Rounded 1c', value: '"M PLUS Rounded 1c", sans-serif', googleId: 'M+PLUS+Rounded+1c:wght@400;700' },
		{ label: 'MS Gothic', value: '"MS Gothic", monospace' },
	];

	function onFontChange() {
		const entry = fonts.find((f) => f.value === fontFamily);
		if (entry?.googleId) loadGoogleFont(entry.googleId);
		applyVisual();
	}

	// Color presets (swatch-only)
	const colorThemes = [
		{ bg: '#ff71ce', card: '#b967ff', text: '#01cdfe', accent: '#05ffa1', link: '#fffb96' },
		{ bg: '#0a0a0a', card: '#111111', text: '#00ff41', accent: '#00ff41', link: '#39ff14' },
		{ bg: '#ff6ec7', card: '#7df9ff', text: '#000000', accent: '#ffff00', link: '#ff1493' },
		{ bg: '#f4ecd8', card: '#efe0c9', text: '#5c4033', accent: '#8b6914', link: '#6b3a2a' },
		{ bg: '#1a1a2e', card: '#16213e', text: '#e94560', accent: '#0f3460', link: '#e94560' },
		{ bg: '#fdf6e3', card: '#eee8d5', text: '#657b83', accent: '#268bd2', link: '#2aa198' },
	];

	function applyTheme(theme: typeof colorThemes[0]) {
		bgColor = theme.bg;
		cardBgColor = theme.card;
		textColor = theme.text;
		accentColor = theme.accent;
		linkColor = theme.link;
		applyVisual();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ed-win" style="left: {x}px; top: {y}px; z-index: {z};">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="ed-titlebar" onmousedown={onTitleDown}>
		<span>Style Editor</span>
		<button class="ed-close" onclick={close} type="button"><X size={12} /></button>
	</div>

	<!-- Tabs -->
	<div class="ed-tabs">
		<button type="button" class="ed-tab" class:ed-tab-active={tab === 'visual'} onclick={() => (tab = 'visual')}>Visual</button>
		<button type="button" class="ed-tab" class:ed-tab-active={tab === 'source'} onclick={() => (tab = 'source')}>Source</button>
		<div class="ed-tab-spacer"></div>
		<button type="button" class="ed-btn-reset" onclick={reset}>Reset</button>
	</div>

	{#snippet colorRow(label: string, value: string, fallback: string, onset: (v: string) => void)}
		<label class="ed-row">
			<span class="ed-label">{label}</span>
			<input type="color" class="ed-color" value={value || fallback}
				oninput={(e) => { onset(e.currentTarget.value); applyVisual(); }} />
			{#if value}
				<button type="button" class="ed-clear"
					onclick={() => { onset(''); applyVisual(); }}>x</button>
			{/if}
		</label>
	{/snippet}

	{#if tab === 'visual'}
		<div class="ed-panel">
			<!-- Theme presets -->
			<fieldset class="ed-group">
				<legend>Presets</legend>
				<div class="ed-presets">
					{#each colorThemes as theme}
						<button type="button" class="ed-swatch" onclick={() => applyTheme(theme)} title="{theme.bg} / {theme.accent}">
							<span class="ed-swatch-half" style="background: {theme.bg}"></span>
							<span class="ed-swatch-half" style="background: {theme.card}"></span>
							<span class="ed-swatch-half" style="background: {theme.accent}"></span>
							<span class="ed-swatch-half" style="background: {theme.text}"></span>
						</button>
					{/each}
				</div>
			</fieldset>

			<!-- Colors -->
			<fieldset class="ed-group">
				<legend>Colors</legend>
				{@render colorRow('Background', bgColor, '#fcf8fd', (v) => bgColor = v)}
				{@render colorRow('Card', cardBgColor, '#f6f2f7', (v) => cardBgColor = v)}
				{@render colorRow('Text', textColor, '#1c1b1f', (v) => textColor = v)}
				{@render colorRow('Accent', accentColor, '#e2e0f9', (v) => accentColor = v)}
				{@render colorRow('Links', linkColor, '#5455a9', (v) => linkColor = v)}
				{@render colorRow('Border', borderColor, '#c8c5d0', (v) => borderColor = v)}
			</fieldset>

			<!-- Typography -->
			<fieldset class="ed-group">
				<legend>Typography</legend>
				<label class="ed-row">
					<span class="ed-label">Font</span>
					<select class="ed-select" bind:value={fontFamily} onchange={onFontChange}>
						{#each fonts as f}
							<option value={f.value}>{f.label}</option>
						{/each}
					</select>
				</label>
				<label class="ed-row">
					<input type="checkbox" bind:checked={fontSizeEnabled} onchange={applyVisual} />
					<span class="ed-label">Size</span>
					<input type="range" class="ed-range" min="8" max="32" bind:value={fontSize} oninput={applyVisual} disabled={!fontSizeEnabled} />
					<span class="ed-value">{fontSize}px</span>
				</label>
				<label class="ed-row">
					<input type="checkbox" bind:checked={letterSpacingEnabled} onchange={applyVisual} />
					<span class="ed-label">Spacing</span>
					<input type="range" class="ed-range" min="-3" max="15" bind:value={letterSpacing} oninput={applyVisual} disabled={!letterSpacingEnabled} />
					<span class="ed-value">{letterSpacing}px</span>
				</label>
				<label class="ed-row">
					<input type="checkbox" bind:checked={lineHeightEnabled} onchange={applyVisual} />
					<span class="ed-label">Line H.</span>
					<input type="range" class="ed-range" min="0.8" max="3" step="0.1" bind:value={lineHeight} oninput={applyVisual} disabled={!lineHeightEnabled} />
					<span class="ed-value">{lineHeight}</span>
				</label>
			</fieldset>

			<!-- Box -->
			<fieldset class="ed-group">
				<legend>Box</legend>
				<label class="ed-row">
					<input type="checkbox" bind:checked={cardGapEnabled} onchange={applyVisual} />
					<span class="ed-label">Gap</span>
					<input type="range" class="ed-range" min="0" max="80" bind:value={cardGap} oninput={applyVisual} disabled={!cardGapEnabled} />
					<span class="ed-value">{cardGap}px</span>
				</label>
				<label class="ed-row">
					<input type="checkbox" bind:checked={borderRadiusEnabled} onchange={applyVisual} />
					<span class="ed-label">Radius</span>
					<input type="range" class="ed-range" min="0" max="50" bind:value={borderRadius} oninput={applyVisual} disabled={!borderRadiusEnabled} />
					<span class="ed-value">{borderRadius}px</span>
				</label>
				<label class="ed-row">
					<input type="checkbox" bind:checked={shadowSizeEnabled} onchange={applyVisual} />
					<span class="ed-label">Shadow</span>
					<input type="range" class="ed-range" min="0" max="20" bind:value={shadowSize} oninput={applyVisual} disabled={!shadowSizeEnabled} />
					<span class="ed-value">{shadowSize}px</span>
				</label>
			</fieldset>

			<!-- Filters -->
			<fieldset class="ed-group">
				<legend>Filters</legend>
				<label class="ed-row">
					<input type="checkbox" bind:checked={hueRotateEnabled} onchange={applyVisual} />
					<span class="ed-label">Hue shift</span>
					<input type="range" class="ed-range" min="0" max="360" bind:value={hueRotate} oninput={applyVisual} disabled={!hueRotateEnabled} />
					<span class="ed-value">{hueRotate}°</span>
				</label>
				<label class="ed-row">
					<input type="checkbox" bind:checked={invert} onchange={applyVisual} />
					<span class="ed-label">Invert</span>
				</label>
				<label class="ed-row">
					<input type="checkbox" bind:checked={grayscale} onchange={applyVisual} />
					<span class="ed-label">Grayscale</span>
				</label>
			</fieldset>
		</div>

	{:else}
		<textarea
			class="ed-textarea"
			bind:value={rawCss}
			oninput={applyRaw}
			placeholder={"/* Edit portal window styles */\n.win-content {\n  \n}"}
			spellcheck="false"
		></textarea>
	{/if}

	<div class="ed-status">
		<span>Live — all portal windows</span>
	</div>
</div>

<style>
	.ed-win {
		position: fixed;
		width: 280px;
		border: 2px solid #000;
		background: #c0c0c0;
		box-shadow: 2px 2px 0 rgba(0,0,0,0.4);
		font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
		font-size: 11px;
		display: flex;
		flex-direction: column;
		user-select: none;
		max-height: 80vh;
	}
	.ed-titlebar {
		background: linear-gradient(90deg, #000080, #1084d0);
		color: white;
		padding: 2px 4px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: grab;
		font-weight: bold;
		font-size: 11px;
	}
	.ed-titlebar:active { cursor: grabbing; }
	.ed-close {
		background: #c0c0c0;
		border: 1px outset #fff;
		padding: 0 2px;
		cursor: pointer;
		display: flex;
		align-items: center;
		color: #000;
	}
	.ed-close:active { border-style: inset; }

	.ed-tabs {
		display: flex;
		gap: 2px;
		padding: 3px 4px 0;
		background: #c0c0c0;
		align-items: flex-end;
	}
	.ed-tab {
		background: #c0c0c0;
		border: 1px solid #808080;
		border-bottom: none;
		padding: 2px 10px;
		font-size: 11px;
		cursor: pointer;
		font-family: inherit;
	}
	.ed-tab-active {
		background: #d4d0c8;
		border-bottom: 1px solid #d4d0c8;
		font-weight: bold;
		position: relative;
		top: 1px;
	}
	.ed-tab-spacer { flex: 1; }
	.ed-btn-reset {
		background: #c0c0c0;
		border: 1px outset #dfdfdf;
		padding: 1px 8px;
		font-size: 10px;
		cursor: pointer;
		font-family: inherit;
		margin-bottom: 2px;
	}
	.ed-btn-reset:active { border-style: inset; }

	.ed-panel {
		overflow-y: auto;
		max-height: 60vh;
		padding: 4px;
		background: #d4d0c8;
		border-top: 1px solid #808080;
	}
	.ed-group {
		border: 1px solid #808080;
		padding: 4px 6px 6px;
		margin: 0 0 4px;
	}
	.ed-group legend {
		font-weight: bold;
		font-size: 10px;
		padding: 0 4px;
		color: #333;
	}
	.ed-row {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 2px 0;
		cursor: default;
	}
	.ed-row input[type="checkbox"] {
		margin: 0;
		width: 13px;
		height: 13px;
		cursor: pointer;
	}
	.ed-label {
		width: 60px;
		flex-shrink: 0;
		font-size: 11px;
		color: #222;
	}
	.ed-color {
		width: 32px;
		height: 20px;
		border: 1px inset #aaa;
		padding: 0;
		cursor: pointer;
		background: none;
	}
	.ed-clear {
		background: none;
		border: 1px solid #999;
		font-size: 9px;
		width: 14px;
		height: 14px;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		color: #666;
	}
	.ed-select {
		flex: 1;
		min-width: 0;
		font-size: 11px;
		border: 1px inset #aaa;
		background: white;
		font-family: inherit;
	}
	.ed-range {
		flex: 1;
		min-width: 0;
		height: 14px;
		cursor: pointer;
	}
	.ed-range:disabled { opacity: 0.3; cursor: default; }
	.ed-value {
		width: 36px;
		text-align: right;
		font-size: 10px;
		color: #555;
		font-family: 'Courier New', monospace;
		flex-shrink: 0;
	}

	/* Presets */
	.ed-presets {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.ed-swatch {
		display: flex;
		width: 28px;
		height: 28px;
		flex-wrap: wrap;
		border: 1px solid #000;
		padding: 0;
		cursor: pointer;
		background: none;
		box-shadow: 1px 1px 0 rgba(0,0,0,0.3);
	}
	.ed-swatch:hover { border-color: #fff; box-shadow: 0 0 0 1px #000, 1px 1px 0 rgba(0,0,0,0.3); }
	.ed-swatch:active { box-shadow: inset 1px 1px 0 rgba(0,0,0,0.3); }
	.ed-swatch-half {
		width: 50%;
		height: 50%;
	}

	.ed-textarea {
		width: 100%;
		height: 200px;
		border: none;
		border-top: 1px solid #808080;
		background: #fff;
		color: #000;
		font-family: 'Courier New', monospace;
		font-size: 12px;
		padding: 4px;
		resize: vertical;
		outline: none;
		user-select: text;
		tab-size: 2;
	}
	.ed-textarea::placeholder { color: #999; }
	.ed-status {
		padding: 2px 6px;
		border-top: 1px solid #808080;
		background: #c0c0c0;
		font-size: 10px;
		color: #555;
	}
</style>
