<script lang="ts">
	import { ThemeToggle, ChaosButton, WordArtMesh, ProjectList, ProfileCard, JobSection, PublicationsSection, PortalWindow, ContactForm } from '$lib/components';
	import { Button, Badge } from '$lib/components/ui';
	import { Twitter, Github, Facebook, AppWindow } from 'lucide-svelte';

	let { data } = $props();

	type WinVariant = 'win95' | 'vista';
	const randomVariant = (): WinVariant => Math.random() < 0.5 ? 'win95' : 'vista';

	let nextId = $state(1);
	let topZ = $state(41);
	let portalWindows = $state<{ id: number; variant: WinVariant; x: number; y: number; w: number; h: number; z: number }[]>([
		{ id: 0, variant: randomVariant(), x: 40, y: 120, w: 340, h: 320, z: 40 }
	]);

	function addWindow() {
		const offset = (portalWindows.length % 5) * 30;
		portalWindows.push({
			id: nextId++,
			variant: randomVariant(),
			x: 60 + offset,
			y: 100 + offset,
			w: 340,
			h: 320,
			z: topZ++
		});
	}

	function focusWindow(id: number) {
		const pw = portalWindows.find(w => w.id === id);
		if (pw && pw.z < topZ - 1) {
			pw.z = topZ++;
		}
	}

	function removeWindow(id: number) {
		portalWindows = portalWindows.filter(w => w.id !== id);
	}
</script>

{#snippet pageContent(portalMode: boolean)}
	<div class="under-construction">
		<span class="construction-emoji">🚧</span> このサイトは工事中です <span class="construction-emoji">🚧</span><br />
		<span class="retro-italic">Sorry, This site is Japanese Only!</span>
	</div>

	<div class="mt-20 flex gap-8">
		<!-- Sidebar -->
		<aside class="hidden w-48 pr-4 md:block">
			<ProfileCard showCounter={true} counterReadOnly={portalMode} />
		</aside>

		<!-- Main Content -->
		<div class="min-w-0 flex-1">
			<!-- Mobile-only Profile Section -->
			<div class="mb-8 md:hidden">
				<ProfileCard />
			</div>

			<!-- Hero Section -->
			<section class="retro-card py-8 text-center">
				<WordArtMesh text="おおたにのポートフォリオ" fontPath="/fonts/GenEi POPle Black_Regular.json" follower={portalMode} />
				<p class="retro-italic mt-2">Media Art Programmer</p>
				<p class="mx-auto mt-4 max-w-2xl">
					メディアアート系のプログラマーです。
				</p>
				<div class="mt-4 overflow-hidden">
					<div class="marquee-content text-blink text-rainbow-animated text-2xl font-bold italic" style="font-family: 'MS Gothic', 'ＭＳ ゴシック', 'MS UI Gothic', monospace;">
						ホームページへようこそ！ゆっくりしていってね！
					</div>
				</div>
				<div class="mt-6">
					<Button variant="outline" class="button-3d" onclick={() => window.location.href = '#contact'}>お問い合わせ</Button>
				</div>
			</section>

			<hr class="my-12 border-black" />

			<!-- About Section -->
			<section id={portalMode ? undefined : "about"} class="retro-card p-4 py-12">
				<h3 class="mb-8 text-center text-3xl font-bold">About</h3>
				<div class="space-y-4">
					<p><strong>1995年生まれ</strong> / 神奈川県横浜市出身</p>

					<h4 class="mt-6 font-bold">学歴・職歴</h4>
					<ul class="ml-4 list-inside list-disc space-y-2">
						<li>横浜国立大学 理工学部 建築都市・環境系学科 卒業</li>
						<li>情報科学芸術大学院大学 メディア表現研究科 修了</li>
						<li>株式会社GOCCO. (2021-2023)</li>
						<li>日本総合ビジネス専門学校 非常勤講師 (2022)</li>
						<li>多摩美術大学 メディア芸術コース研究室 非常勤嘱託 (2023-2024)</li>
						<li>株式会社マーブル (2024-)</li>
					</ul>
				</div>
			</section>

			<hr class="my-12 border-black" />

			<!-- Skills Section -->
			<section id={portalMode ? undefined : "skills"} class="retro-card p-4 py-12 text-center">
				<h3 class="mb-8 text-3xl font-bold">Skills</h3>
				<div class="flex flex-wrap justify-center gap-4">
					<Badge variant="outline" class="button-3d">Unity</Badge>
					<Badge variant="outline" class="button-3d">UnrealEngine</Badge>
					<Badge variant="outline" class="button-3d">TouchDesigner</Badge>
					<Badge variant="outline" class="button-3d">Houdini</Badge>
					<Badge variant="outline" class="button-3d">Rhinoceros/Grasshopper</Badge>
					<Badge variant="outline" class="button-3d">Python</Badge>
					<Badge variant="outline" class="button-3d">Swift</Badge>
					<Badge variant="outline" class="button-3d">Next.js</Badge>
					<Badge variant="outline" class="button-3d">MicroPython</Badge>
					<Badge variant="outline" class="button-3d">Arduino</Badge>
					<Badge variant="outline" class="button-3d">C/C#</Badge>
				</div>
			</section>

			<hr class="my-12 border-black" />

			<!-- Projects Section -->
			<div class="retro-card p-4">
				<ProjectList projects={data.projects} />
			</div>

			<hr class="my-12 border-black" />

			<!-- Jobs Section (password protected) -->
			<div class="retro-card p-4">
				<JobSection />
			</div>

			<hr class="my-12 border-black" />

			<!-- Publications Section -->
			<div class="retro-card p-4">
				<PublicationsSection />
			</div>
		</div>
	</div>

	<!-- Chaos Button Section -->
	<section class="py-12 text-center">
		<ChaosButton />
	</section>

	<!-- Footer -->
	<footer id={portalMode ? undefined : "contact"} class="mt-10 border-t border-black py-8">
		<div class="text-center">
			<h3 class="mb-4 text-2xl font-bold">Contact</h3>
			<ContactForm accessKey="23fb1941-0392-463a-9540-8cdd3aef47f8" />
			<div class="mt-6 flex justify-center gap-4">
				<a href="https://twitter.com/haetoribachi" target="_blank" rel="noopener noreferrer" class="no-underline"><Twitter /></a>
				<a href="https://github.com/otanl" target="_blank" rel="noopener noreferrer" class="no-underline"><Github /></a>
				<a href="https://www.facebook.com/yoshiyuki.ohtani.10" target="_blank" rel="noopener noreferrer" class="no-underline"><Facebook /></a>
			</div>
			<p class="mt-4">© 2025 Yoshiyuki Ootani. All rights reserved.</p>
		</div>
	</footer>
{/snippet}

<svelte:head>
	<title>Yoshiyuki Ootani</title>
</svelte:head>

<!-- SVG filter for liquid glass (ref: lucasromerodb/liquid-glass-effect-macos) -->
<svg style="display: none" aria-hidden="true">
	<filter id="glass-distortion" x="-2%" y="0%" width="104%" height="100%" filterUnits="objectBoundingBox">
		<feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
		<feComponentTransfer in="turbulence" result="mapped">
			<feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
			<feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
			<feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
		</feComponentTransfer>
		<feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
		<feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lighting-color="white" result="specLight">
			<fePointLight x="-200" y="-200" z="300" />
		</feSpecularLighting>
		<feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
		<feDisplacementMap in="SourceGraphic" in2="softMap" scale="80" xChannelSelector="R" yChannelSelector="G" result="displaced" />
		<!-- Chromatic aberration (RGB shift) — simulates prismatic refraction -->
		<feColorMatrix type="matrix" in="displaced" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
		<feOffset in="r" dx="-3" dy="0" result="rOff" />
		<feOffset in="b" dx="3" dy="0" result="bOff" />
		<feBlend in="rOff" in2="g" mode="screen" result="rg" />
		<feBlend in="rg" in2="bOff" mode="screen" />
	</filter>
	<!-- Glitch effect: animated displacement + RGB split + scanlines -->
	<filter id="glitch-effect" x="-10%" y="-5%" width="120%" height="110%">
		<!-- Horizontal band noise (high vertical freq = horizontal bands) -->
		<feTurbulence type="fractalNoise" baseFrequency="0.01 0.5" numOctaves="1" seed="0" result="noise">
			<animate attributeName="seed" values="0;10;5;15;3;8;12;1;7;14;2;9;6;13;4" dur="0.25s" repeatCount="indefinite" />
			<animate attributeName="baseFrequency" values="0.01 0.5;0.02 0.8;0.005 0.3;0.03 0.6;0.01 0.5" dur="0.4s" repeatCount="indefinite" />
		</feTurbulence>
		<!-- Displacement — scale driven by JS mouse velocity -->
		<feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced" />
		<!-- RGB channel split -->
		<feColorMatrix type="matrix" in="displaced" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
		<!-- RGB offsets — driven by JS mouse velocity -->
		<feOffset in="r" dx="-3" dy="0" result="rOff" />
		<feOffset in="b" dx="3" dy="0" result="bOff" />
		<feBlend in="rOff" in2="g" mode="screen" result="rg" />
		<feBlend in="rg" in2="bOff" mode="screen" result="merged" />
		<!-- CRT scanlines overlay -->
		<feImage width="1" height="4" result="scanTile"
			href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='4'%3E%3Crect width='1' height='2' fill='white'/%3E%3Crect y='2' width='1' height='2' fill='%23ccc'/%3E%3C/svg%3E"/>
		<feTile in="scanTile" result="scanlines"/>
		<feBlend in="merged" in2="scanlines" mode="multiply"/>
	</filter>

	<!-- Glass distortion (strong) for PortalWindow — JS-driven animation -->
	<filter id="glass-distortion-strong" x="-12%" y="-8%" width="124%" height="116%" filterUnits="objectBoundingBox">
		<feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="1" seed="5" result="turbulence" />
		<feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
		<!-- Position-dependent offset (JS updates dx/dy based on window pos) -->
		<feOffset in="softMap" dx="0" dy="0" result="shiftedMap" />
		<feDisplacementMap in="SourceGraphic" in2="shiftedMap" scale="75" xChannelSelector="R" yChannelSelector="G" result="displaced" />
		<feColorMatrix type="matrix" in="displaced" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
		<feOffset in="r" dx="-5" dy="0" result="rOff" />
		<feOffset in="b" dx="5" dy="0" result="bOff" />
		<feBlend in="rOff" in2="g" mode="screen" result="rg" />
		<feBlend in="rg" in2="bOff" mode="screen" />
	</filter>

	<!-- Halftone dot-screen: per-channel color halftone (pop-art style) -->
	<filter id="halftone-filter" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
		<feGaussianBlur in="SourceGraphic" stdDeviation="1" result="smooth"/>
		<feImage x="0" y="0" width="8" height="8" result="dotTile"
			href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0' stop-color='white'/%3E%3Cstop offset='1' stop-color='black'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='8' height='8' fill='url(%23g)'/%3E%3C/svg%3E"/>
		<feTile in="dotTile" result="dots"/>
		<feComposite in="smooth" in2="dots" operator="arithmetic" k1="0" k2="1" k3="1" k4="-0.5" result="combined"/>
		<feComponentTransfer in="combined">
			<feFuncR type="discrete" tableValues="0 1"/>
			<feFuncG type="discrete" tableValues="0 1"/>
			<feFuncB type="discrete" tableValues="0 1"/>
		</feComponentTransfer>
	</filter>

</svg>

<!-- Header -->
<header class="liquid-glass-header fixed left-0 right-0 top-0 z-50">
	<div class="liquid-glass-effect" style="filter: url(#glass-distortion)"></div>
	<div class="liquid-glass-tint"></div>
	<div class="liquid-glass-shine"></div>
	<div class="liquid-glass-inner flex flex-wrap items-center justify-between gap-2 px-4 py-3">
		<h1 class="text-xl font-bold sm:text-2xl">Yoshiyuki Ootani</h1>
		<nav class="flex flex-wrap items-center gap-1 text-sm sm:gap-2 sm:text-base">
			<a href="#about" class="star-marker">About</a>
			<a href="#skills" class="star-marker">Skills</a>
			<a href="#projects" class="star-marker">Projects</a>
			<a href="#jobs" class="star-marker">Jobs</a>
			<a href="#publications" class="star-marker">Publications</a>
			<a href="#contact" class="star-marker">Contact</a>
			<Button variant="ghost" size="icon" onclick={addWindow} title="modern.exe を開く">
				<AppWindow class="h-[1.2rem] w-[1.2rem]" />
			</Button>
			<ThemeToggle />
		</nav>
	</div>
</header>

<!-- Retro version (normal page) -->
<main class="retro-text mx-auto max-w-5xl overflow-hidden px-4 pt-24">
	{@render pageContent(false)}
</main>

<!-- Portal windows -->
{#each portalWindows as pw (pw.id)}
	<PortalWindow title="modern.exe" variant={pw.variant} initialX={pw.x} initialY={pw.y} initialW={pw.w} initialH={pw.h} zIndex={pw.z} onfocus={() => focusWindow(pw.id)} onclose={() => removeWindow(pw.id)}>
		<main class="retro-text mx-auto max-w-5xl overflow-hidden px-4 pt-24">
			{@render pageContent(true)}
		</main>
	</PortalWindow>
{/each}
