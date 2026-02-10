<script lang="ts">
	import { browser } from '$app/environment';

	let isBroken = $state(false);
	let isDark = $state(false);

	$effect(() => {
		if (!browser) return;
		const check = () => {
			isDark = document.documentElement.classList.contains('dark');
		};
		check();
		const observer = new MutationObserver(check);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	function breakCss() {
		isBroken = true;
		const allElements = document.querySelectorAll<HTMLElement>('*');

		const applyChaos = () => {
			allElements.forEach((el) => {
				if (el.closest('[data-chaos-immune]')) return;
				const r = (max: number, min = 0) => Math.random() * (max - min) + min;
				el.style.transition = 'all 0.1s linear';
				el.style.transform = `rotate(${r(360)}deg) scale(${r(1.5, 0.5)}) skew(${r(45)}deg, ${r(45)}deg) translateX(${r(20, -20)}px) translateY(${r(20, -20)}px)`;
				el.style.filter = `hue-rotate(${r(360)}deg) saturate(${r(200)}%) brightness(${r(150)}%) contrast(${r(200)}%) blur(${r(1)}px)`;
				el.style.color = `rgb(${r(255)}, ${r(255)}, ${r(255)})`;
				el.style.backgroundColor = `rgb(${r(255)}, ${r(255)}, ${r(255)})`;
			});
		};

		applyChaos();
		setInterval(applyChaos, 200);
	}
</script>

<button
	onclick={breakCss}
	disabled={isBroken}
	data-chaos-immune
	class="
		inline-flex items-center justify-center
		border-transparent
		bg-[#e2dfe5] dark:bg-[#2d2b31]
		rounded-full h-auto w-auto py-2
		shadow-[8px_8px_16px_#c4c1c7,_-8px_-8px_16px_#f0edf3]
		dark:shadow-[8px_8px_16px_#1e1c22,_-8px_-8px_16px_#3a383e]
		active:shadow-[inset_8px_8px_16px_#c4c1c7,inset_-8px_-8px_16px_#f0edf3]
		dark:active:shadow-[inset_8px_8px_16px_#1e1c22,inset_-8px_-8px_16px_#3a383e]
		transform active:scale-95 transition-all duration-150 ease-in-out
	"
>
	<svg width="240" height="40" viewBox="0 0 240 40">
		<defs>
			<linearGradient id="retro-rainbow" gradientUnits="userSpaceOnUse" x1="0" x2="480">
				{#if isDark}
					<stop stop-color="#ffadad" offset="0" />
					<stop stop-color="#ffffa1" offset="0.1" />
					<stop stop-color="#a1ffa1" offset="0.2" />
					<stop stop-color="#a1a1ff" offset="0.3" />
					<stop stop-color="#ffa1ff" offset="0.4" />
					<stop stop-color="#ffadad" offset="0.5" />
					<stop stop-color="#ffadad" offset="0.5" />
					<stop stop-color="#ffffa1" offset="0.6" />
					<stop stop-color="#a1ffa1" offset="0.7" />
					<stop stop-color="#a1a1ff" offset="0.8" />
					<stop stop-color="#ffa1ff" offset="0.9" />
					<stop stop-color="#ffadad" offset="1" />
				{:else}
					<stop stop-color="#ff0000" offset="0" />
					<stop stop-color="#ffff00" offset="0.1" />
					<stop stop-color="#00ff00" offset="0.2" />
					<stop stop-color="#0000ff" offset="0.3" />
					<stop stop-color="#ff00ff" offset="0.4" />
					<stop stop-color="#ff0000" offset="0.5" />
					<stop stop-color="#ff0000" offset="0.5" />
					<stop stop-color="#ffff00" offset="0.6" />
					<stop stop-color="#00ff00" offset="0.7" />
					<stop stop-color="#0000ff" offset="0.8" />
					<stop stop-color="#ff00ff" offset="0.9" />
					<stop stop-color="#ff0000" offset="1" />
				{/if}
				<animateTransform
					attributeName="gradientTransform"
					type="translate"
					from="0"
					to="-240"
					dur="4s"
					repeatCount="indefinite"
					calcMode="linear"
				/>
			</linearGradient>
		</defs>

		<text
			x="50%"
			y="50%"
			fill="url(#retro-rainbow)"
			font-family="'Noto Sans JP', sans-serif"
			font-weight="700"
			font-size="1.25rem"
			dominant-baseline="central"
			text-anchor="middle"
		>
			{isBroken ? 'もう何もわからない' : 'CSS完全に理解した'}
		</text>
	</svg>
</button>
