<script lang="ts">
	import { onMount } from 'svelte';
	import { ThemeToggle, ChaosButton, WordArtMesh, ProjectList, ProfileCard, JobSection, PublicationsSection, PortalWindow, ContactForm } from '$lib/components';
	import { Button, Badge } from '$lib/components/ui';
	import { Twitter, Github, Facebook, AppWindow, Menu, X } from 'lucide-svelte';

	let { data } = $props();

	type WinVariant = 'win95' | 'vista';
	const randomVariant = (): WinVariant => Math.random() < 0.5 ? 'win95' : 'vista';

	let nextId = $state(1);
	let topZ = $state(41);
	let mobileMenuOpen = $state(false);
	let lang = $state<'ja' | 'en'>('ja');
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

	const t = $derived(lang === 'ja'
		? {
			underConstruction: 'このサイトは工事中です',
			browse: '鋭意工事中。完成までしばしお待ちを。',
			profileSummary: 'メディアアート領域を中心に活動するプログラマーです。',
			marquee: 'ホームページへようこそ。ゆっくりしていってね！！',
			contactCta: 'お問い合わせ',
			aboutHeading: 'About',
			careerHeading: '学歴・職歴',
			bio: '1995年生まれ / 神奈川県横浜市出身',
			contactHeading: 'お問い合わせ',
			careerItems: [
				'横浜国立大学 理工学部 建築・都市環境系学科 卒業',
				'情報科学芸術大学院大学 メディア表現研究科 修了',
				'株式会社GOCCO. (2021-2023)',
				'日本総合ビジネス専門学校 非常勤講師 (2022)',
				'多摩美術大学 メディア芸術コース研究室 非常勤嘱託 (2023-2024)',
				'株式会社マーブル (2024-)'
			]
		}
		: {
			underConstruction: 'This site is under construction',
			browse: 'Now updating by hand, one tag at a time.',
			profileSummary: 'I am a programmer working mainly in media art.',
			marquee: 'Welcome to my website. Please enjoy your visit.',
			contactCta: 'Contact',
			aboutHeading: 'About',
			careerHeading: 'Education & Work Experience',
			bio: 'Born in 1995 / From Yokohama, Kanagawa, Japan',
			contactHeading: 'Contact',
			careerItems: [
				'Yokohama National University, Faculty of Engineering Science, Department of Architecture and Urban Environment (B.A.)',
				'Institute of Advanced Media Arts and Sciences, Media Expression (MFA)',
				'GOCCO. Inc. (2021-2023)',
				'Part-time Lecturer, Nihon Sogo Business Senmon Gakko (Japanese Vocational School) (2022)',
				'Part-time Research Assistant, Tama Art University, Media Art Course Lab (2023-2024)',
				'Marble Corp. (2024-)'
			]
		}
	);

	const projectTranslations: Record<string, { description: string; content: string }> = {
		'01-culture-technique-of-your-life': {
			description: 'With the rapid development of technology, services and products are emerging that challenge conventional values. This project explores what possibilities cell-culture technologies might bring into everyday life through stories, products, and media art simulations focused on intimacy, marriage, and bereavement.',
			content: `As technology advances, new services and products are emerging that can shake conventional values.\nWhat possibilities could cell-culture technologies, already successful in medicine and livestock industries, bring to our daily lives?\n\nFocusing on the theme of "how we connect with loved ones," this project spotlights life events such as intimacy, marriage, and bereavement, and simulates imagined futures from research papers through stories, products, and media art.\n\nHow would we feel if ethically uncomfortable ideas appeared with vivid physical reality?\nA possible future of culture technology in your life.\n\nThis project is a collaboration between Academimic, which seeks new forms of research output beyond papers and conferences, and PxCell, which explores a society connected through cells.\n\nDate: Jan 12-14, 2024, 10:00-20:00\nVenue: Shibuya Kinro Fukushi Kaikan 2F, Japanese-style room\n\n[Details](https://academimic.com/cy)`
		},
		'02-1jFqVljvPqrWnndUMzYIlm': {
			description: 'A visual novel game for iOS/Android. Interaction is mostly tap-based, while the game extends into QR codes, Google Docs, and websites as part of the experience.',
			content: `A visual novel game for iOS/Android.\nThe basic interaction is tapping, while players enjoy operations that jump to QR codes, Google Docs, and websites.\n\nDirection: Raku Asao\nSystem: Yoshiyuki Ootani\nScenario: Kohei Ooike\n\n[KAMIGAME Creator Evolution 2023 Finalist](https://kamigame-evo.com/2)\n[App Store](https://apps.apple.com/sa/app/%E3%81%B5%E3%81%8C%E3%81%84%E3%81%AA%E3%81%84%E7%A9%BA%E3%81%AE%E8%A1%97/id6474100473)`
		},
		'03-pxcell': {
			description: 'A project aiming to imagine a world where human cells can be exchanged. By prototyping products with blockchain, it examines ownership, unauthorized collection, and rule-making around genetic material.',
			content: `This project explores a world in which human cells can be bought and sold.\nBy productizing cells as fan goods, charms, or mementos using blockchain technology, we investigate potential issues and opportunities including unauthorized genetic sampling, cell ownership, and related technical challenges, then develop rule-making proposals.\n\nProject Lead: Ryuto Kawamata\nEngineer: Yoshiyuki Ootani\nDesigner: Naoto Nakamura\n\n[100BANCH Garage Program #72](https://100banch.com/projects/cybor-ichiba)\n[Blockcerts verification prototype](https://blockcerts-verifier.vercel.app/)`
		},
		'04-ext': {
			description: 'An installation using original PS1 software and a circuit-bending device that physically disrupts it, exploring real-time retro game materiality beyond nostalgia.',
			content: `An installation work combining original PS1 software and a circuit-bending device that destroys it.\nThe 3D visuals rendered under hardware constraints are disrupted independently of user input and eventually freeze.\nThis is an attempt to explore the real-time nature of retro games from a perspective different from pure retro nostalgia, within a modding culture that does not separate hardware and software.\n\n[Tama Art University Assistant Exhibition 2023](https://www2.tamabi.ac.jp/yuga/within-campus/2638/)\n[GitHub](https://github.com/gameguys-jp/EXT)`
		},
		'05-game-guys': {
			description: 'A DJ/VJ performance unit using retro games as instruments and visuals.',
			content: `A DJ/VJ performance unit using retro games.\nOotani: VJ, software, hardware\nKawamata: DJ, composition\n\nAppearances:\n[2021.02.20 - NxPC.Live Vol.47 ](https://www.youtube.com/live/7LAeQY35Wa4?si=bMR_KmMffDeOhAYe)\n[2020.02.23 - NxPC.LIVE Vol.42 “IAMAS2020 Graduation Exhibition” ](https://youtu.be/lMPSitKIpt4?si=Sms7u0e2K221j1sM)\n[2019.12.20 - NxPC.Live vol.38 & freq KID x IAMAS LIVE](https://www.youtube.com/live/OckMlmBX8pM?si=qzcu0Vmqx7HzKNbL)\n[2019.11.06 - Interim Report Edition4](https://interim-report.org/edition4/)\n[2019.09.30 - LPPT vol.3](https://www.iamas.ac.jp/activity/lppt-vol-3/)\n[2019.07.27 - NxPC.Lab Vol.37 #OPENHOUSE](https://youtu.be/LXadnSdjupk?si=OkrfjCwgj5NwRScr)\n[2019.06.11 - NxPC.Live New Generation2019](https://www.youtube.com/watch?v=nDU0NOBvOWI)`
		},
		'06-5FIMBhHQYkalGJ3PDy8Xy6': {
			description: 'Operation of an internet rap community, with research and practice on the possibilities and rule-making of online communities under capitalist realism (master thesis).',
			content: `Operation of an internet rap community.\nResearch and practice on the possibilities of online communities under capitalist realism, and on their rule-making.\n\n[Master thesis](https://drive.google.com/file/d/1G_YtC4CaIcQUBjA4O0gNtkOYOcP81bvO/view?usp=sharing)`
		},
		'07-architectual-works-2014-2018': {
			description: 'Portfolio from architecture school years (2014-2018).',
			content: `Portfolio from architecture school years (2014-2018).\n\n[docswell](https://www.docswell.com/s/4096262/ZQ84J7-2023-11-06-154509)`
		}
	};

	const localizedProjects = $derived(
		lang === 'en'
			? data.projects.map((project) => {
				const translated = projectTranslations[project.slug];
				return translated
					? { ...project, description: translated.description, content: translated.content }
					: project;
			})
			: data.projects
	);

	onMount(() => {
		const saved = localStorage.getItem('lang');
		if (saved === 'ja' || saved === 'en') lang = saved;
	});

	function toggleLang() {
		lang = lang === 'ja' ? 'en' : 'ja';
		localStorage.setItem('lang', lang);
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

{#snippet pageContent(portalMode: boolean)}
	<div class="under-construction">
		<span class="construction-emoji">🚧</span> {t.underConstruction} <span class="construction-emoji">🚧</span><br />
		<span class="retro-italic">{t.browse}</span>
	</div>

	<div class="mt-20 flex gap-8">
		<!-- Sidebar -->
		<aside class="hidden w-48 pr-4 md:block">
			<ProfileCard lang={lang} showCounter={true} counterReadOnly={portalMode} />
		</aside>

		<!-- Main Content -->
		<div class="min-w-0 flex-1">
			<!-- Mobile-only Profile Section -->
			<div class="mb-8 md:hidden">
				<ProfileCard lang={lang} />
			</div>

			<!-- Hero Section -->
			<section class="retro-card py-8 text-center">
				<WordArtMesh text="おおたにのポートフォリオ" fontPath="/fonts/GenEi POPle Black_Regular.json" follower={portalMode} />
				<p class="mx-auto mt-4 max-w-2xl">
					{t.profileSummary}
				</p>
				<div class="mt-4 overflow-hidden">
					<div class="marquee-content text-blink text-rainbow-animated text-2xl font-bold italic" style="font-family: 'MS Gothic', 'MS ゴシック', 'MS UI Gothic', monospace;">
						{t.marquee}
					</div>
				</div>
				<div class="mt-6">
					<Button variant="outline" class="button-3d" onclick={() => window.location.href = '#contact'}>{t.contactCta}</Button>
				</div>
			</section>

			<hr class="my-12 border-black" />

			<!-- About Section -->
			<section id={portalMode ? undefined : "about"} class="retro-card p-4 py-12">
				<h3 class="mb-8 text-center text-3xl font-bold">{t.aboutHeading}</h3>
				<div class="space-y-4">
					<p>{t.bio}</p>

					<h4 class="mt-6 font-bold">{t.careerHeading}</h4>
					<ul class="ml-4 list-inside list-disc space-y-2">
						{#each t.careerItems as item}
							<li>{item}</li>
						{/each}
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
				<ProjectList projects={localizedProjects} />
			</div>

			<hr class="my-12 border-black" />

			<!-- Jobs Section (password protected) -->
			<div id={portalMode ? undefined : "jobs"} class="retro-card p-4">
				<JobSection lang={lang} />
			</div>

			<hr class="my-12 border-black" />

			<!-- Publications Section -->
			<div class="retro-card p-4">
				<PublicationsSection lang={lang} />
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
			<h3 class="mb-4 text-2xl font-bold">{t.contactHeading}</h3>
			<ContactForm lang={lang} accessKey="23fb1941-0392-463a-9540-8cdd3aef47f8" />
			<div class="mt-6 flex justify-center gap-4">
				<a href="https://twitter.com/haetoribachi" target="_blank" rel="noopener noreferrer" class="no-underline"><Twitter /></a>
				<a href="https://github.com/otanl" target="_blank" rel="noopener noreferrer" class="no-underline"><Github /></a>
				<a href="https://www.facebook.com/yoshiyuki.ohtani.10" target="_blank" rel="noopener noreferrer" class="no-underline"><Facebook /></a>
			</div>
			<p class="mt-4">&copy; 2025 Yoshiyuki Ootani. All rights reserved.</p>
		</div>
	</footer>
{/snippet}

<svelte:head>
	<title>Yoshiyuki Ootani</title>
</svelte:head>

<!-- SVG filter for liquid glass (ref: lucasromerodb/liquid-glass-effect-macos) -->
<svg style="position: absolute; width: 0; height: 0" aria-hidden="true">
	<defs>
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
		<!-- Chromatic aberration (RGB shift) 窶・simulates prismatic refraction -->
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
		<!-- Displacement 窶・scale driven by JS mouse velocity -->
		<feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" result="displaced" />
		<!-- RGB channel split -->
		<feColorMatrix type="matrix" in="displaced" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
		<feColorMatrix type="matrix" in="displaced" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
		<!-- RGB offsets 窶・driven by JS mouse velocity -->
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

	<!-- Glass distortion (strong) for PortalWindow 窶・JS-driven animation -->
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
	</defs>
</svg>

<!-- Header -->
<header class="liquid-glass-header fixed left-0 right-0 top-0 z-50">
	<div class="liquid-glass-effect" style="filter: url(#glass-distortion)"></div>
	<div class="liquid-glass-tint"></div>
	<div class="liquid-glass-shine"></div>
	<div class="liquid-glass-inner px-4">
		<div class="header-row flex items-center gap-3">
			<h1 class="shrink-0 text-lg font-bold sm:text-xl">Yoshiyuki Ootani</h1>
			<nav class="header-nav hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm md:flex">
				<a href="#about" class="star-marker">About</a>
				<a href="#skills" class="star-marker">Skills</a>
				<a href="#projects" class="star-marker">Projects</a>
				<a href="#jobs" class="star-marker">Jobs</a>
				<a href="#publications" class="star-marker">Publications</a>
				<a href="#contact" class="star-marker">Contact</a>
			</nav>
			<div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
				<Button variant="ghost" size="icon" onclick={addWindow} title="Open modern.exe">
					<AppWindow class="h-[1.2rem] w-[1.2rem]" />
				</Button>
				<Button variant="outline" class="button-3d px-2 py-1 text-xs" onclick={toggleLang}>
					{lang === 'ja' ? 'EN' : 'JP'}
				</Button>
				<ThemeToggle />
				<Button
					variant="ghost"
					size="icon"
					class="md:hidden"
					aria-label="Toggle navigation menu"
					aria-expanded={mobileMenuOpen}
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				>
					{#if mobileMenuOpen}
						<X class="h-[1.2rem] w-[1.2rem]" />
					{:else}
						<Menu class="h-[1.2rem] w-[1.2rem]" />
					{/if}
				</Button>
			</div>
		</div>
		{#if mobileMenuOpen}
			<nav class="pb-3 pt-2 grid gap-2 border-t border-black/20 text-base md:hidden">
				<a href="#about" class="star-marker" onclick={closeMobileMenu}>About</a>
				<a href="#skills" class="star-marker" onclick={closeMobileMenu}>Skills</a>
				<a href="#projects" class="star-marker" onclick={closeMobileMenu}>Projects</a>
				<a href="#jobs" class="star-marker" onclick={closeMobileMenu}>Jobs</a>
				<a href="#publications" class="star-marker" onclick={closeMobileMenu}>Publications</a>
				<a href="#contact" class="star-marker" onclick={closeMobileMenu}>Contact</a>
			</nav>
		{/if}
	</div>
</header>

<!-- Retro version (normal page) -->
<main class="site-main retro-text mx-auto max-w-5xl overflow-hidden px-4">
	{@render pageContent(false)}
</main>

<!-- Portal windows -->
{#each portalWindows as pw (pw.id)}
	<PortalWindow title="modern.exe" variant={pw.variant} initialX={pw.x} initialY={pw.y} initialW={pw.w} initialH={pw.h} zIndex={pw.z} onfocus={() => focusWindow(pw.id)} onclose={() => removeWindow(pw.id)}>
		<main class="site-main retro-text mx-auto max-w-5xl overflow-hidden px-4">
			{@render pageContent(true)}
		</main>
	</PortalWindow>
{/each}

