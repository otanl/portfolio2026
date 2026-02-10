<script lang="ts">
	import AccessCounter from './AccessCounter.svelte';
	import { ChevronRight } from 'lucide-svelte';

	interface Props {
		showCounter?: boolean;
		counterReadOnly?: boolean;
	}

	let { showCounter = false, counterReadOnly = false }: Props = $props();
</script>

<div class="retro-card p-4">
	<h4 class="mb-2 text-lg font-bold">Profile</h4>
	<img
		src="/icon_mono.png"
		alt="Profile"
		class="retro-only retro-image mx-auto mb-4 h-32 w-32 border-2 border-black"
	/>
	<img
		src="/icon.jpg"
		alt="Profile"
		class="modern-only retro-image mx-auto mb-4 h-32 w-32 border-2 border-black"
	/>
	<p class="text-center font-bold">大谷芳之</p>
	<p class="text-center text-xs">Yoshiyuki Ootani</p>

	<hr class="my-4 border-black" />

	<h4 class="mb-2 text-lg font-bold">Link</h4>
	<ul class="space-y-2">
		<li class="flex items-center gap-1">
			<img src="/textures/arrow.gif" alt="矢印" class="retro-only inline-block h-4 w-4" />
			<ChevronRight size={14} class="modern-only" />
			<a href="#about">About</a>
		</li>
		<li class="flex items-center gap-1">
			<img src="/textures/arrow.gif" alt="矢印" class="retro-only inline-block h-4 w-4" />
			<ChevronRight size={14} class="modern-only" />
			<a href="#skills">Skills</a>
		</li>
		<li class="flex items-center gap-1">
			<img src="/textures/arrow.gif" alt="矢印" class="retro-only inline-block h-4 w-4" />
			<ChevronRight size={14} class="modern-only" />
			<a href="#projects">Projects</a>
		</li>
		<li class="flex items-center gap-1">
			<img src="/textures/arrow.gif" alt="矢印" class="retro-only inline-block h-4 w-4" />
			<ChevronRight size={14} class="modern-only" />
			<a href="#contact">Contact</a>
		</li>
	</ul>

	<hr class="my-4 border-black" />

	<img src="/textures/test.gif" alt="キラキラGIF" class="retro-only mx-auto" />
	<div class="modern-only mx-auto" style="aspect-ratio: 408/238; width: 100%;"></div>

	{#if showCounter}
		<div class="mt-4 text-center">
			<img
				src="https://www.gif-mania.net/animated-gif/counter/counter-7.gif"
				alt="訪問者カウンター"
				class="retro-only mx-auto"
			/>
			<p class="mt-2 text-sm">あなたは</p>
			<AccessCounter readOnly={counterReadOnly} />
			<p class="text-sm">番目のお客様です</p>
			<p class="retro-only mt-2 text-xs text-red-600">
				キリ番踏んだらカキコ<br />踏み逃げ厳禁！
			</p>
		</div>
	{/if}
</div>
