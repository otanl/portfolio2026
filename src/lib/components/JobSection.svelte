<script lang="ts">
	import { Lock, Unlock } from 'lucide-svelte';
	import { slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Project } from '$lib/types';
	import ProjectList from './ProjectList.svelte';
	import { jobState } from '$lib/stores/portal';

	interface Props {
		lang?: 'ja' | 'en';
	}

	let { lang = 'ja' }: Props = $props();
	let password = $state('');

	const t = $derived(lang === 'ja'
		? {
			locked: 'このセクションはパスワードで保護されています。',
			passwordPlaceholder: 'パスワードを入力',
			loading: '認証中...',
			unlock: 'ロック解除',
			wrongPassword: 'パスワードが違います',
			networkError: '通信エラーが発生しました'
		}
		: {
			locked: 'This section is protected by a password.',
			passwordPlaceholder: 'Enter password',
			loading: 'Authenticating...',
			unlock: 'Unlock',
			wrongPassword: 'Incorrect password',
			networkError: 'A network error occurred'
		}
	);

	// Use shared store so retro and portal instances stay in sync
	let status = $derived($jobState.status);
	let jobs = $derived($jobState.jobs);
	let errorMessage = $derived($jobState.errorMessage);

	const jobTranslations: Record<string, { description: string; content: string }> = {
		'01-XRKaigi': {
			description: 'Marble Corp. exhibited a prototype called POISE (Position-Oriented Interactive System Enhancer), which dynamically adapts user interfaces in real time based on user location.',
			content: `Marble Corp.\n\nExhibited a prototype system, "POISE (Position-Oriented Interactive System Enhancer)," that dynamically adapts user interfaces in real time based on user location.`
		},
		'02-ommf': {
			description: 'Marble Corp. exhibited POISE (Position-Oriented Interactive System Enhancer), a prototype that dynamically adapts user interfaces in real time based on user location.',
			content: `Marble Corp.\n\nExhibited a prototype system, "POISE (Position-Oriented Interactive System Enhancer)," that dynamically adapts user interfaces in real time based on user location.`
		},
		'03-2022-2023': {
			description: 'At GOCCO. (and as a freelancer in 2023), contributed to selected content production for Ogaki Illumination 2022/2023 organized by Ogaki City, handling outdoor DMX lighting system design and show direction.',
			content: `GOCCO. Inc.\n\nWorked on selected content production for Ogaki Illumination 2022 and 2023 organized by Ogaki City (participated as a freelancer in 2023).\n\nResponsible for system design and show direction for outdoor illumination using DMX lighting.`
		},
		'04-cocoropa': {
			description: 'At GOCCO., built an improved robot prototype for a major electronics manufacturer R&D project, handling programming and PCB implementation.',
			content: `GOCCO. Inc.\n\nBuilt an improved robot prototype for a major electronics manufacturer R&D project.\n\nResponsible for programming and PCB implementation.`
		},
		'05-2022': {
			description: 'At GOCCO., created the visual direction system for the final session of the children\'s workshop "Neo Beat Kami-Sumo 2022" at Komaki Children\'s Future Museum, using TouchDesigner for audio-reactive projection.',
			content: `GOCCO. Inc.\n\nProduced visual direction for the final session of the children's workshop "Neo Beat Kami-Sumo" at Komaki Children's Future Museum.\n\nResponsible for building an audio-reactive projection system using TouchDesigner.`
		},
		'06-6D1YIZgdIJqraLYWoNUkRY': {
			description: 'At GOCCO., contributed to a giant hands-on marble-run installation "#ぺたころ" at Seaside Park Nagoya (Kinjo-Futo), producing fixtures and parts with 3D printers and other fabrication tools.',
			content: `GOCCO. Inc.\n\nA giant marble-run style installation placed in the plaza at "Seaside Park Nagoya in Kinjo-Futo," designed for both adults and children to enjoy by combining parts and creating original routes.\n\nResponsible for fixture production and part fabrication using 3D printers and related tools.`
		}
	};

	const localizedJobs = $derived(
		lang === 'en'
			? jobs.map((job) => {
				const translated = jobTranslations[job.slug];
				return translated
					? { ...job, description: translated.description, content: translated.content }
					: job;
			})
			: jobs
	);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!password.trim()) return;

		jobState.update(s => ({ ...s, status: 'loading', errorMessage: '' }));

		try {
			const res = await fetch('/api/jobs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			const data = await res.json();

			if (res.ok) {
				jobState.set({ status: 'unlocked', jobs: data.jobs, errorMessage: '' });
			} else {
				jobState.update(s => ({
					...s,
					status: 'error',
					errorMessage: data.error || t.wrongPassword
				}));
			}
		} catch {
			jobState.update(s => ({
				...s,
				status: 'error',
				errorMessage: t.networkError
			}));
		}
	}
</script>

<section id="jobs" class="py-20">
	<h2 class="mb-12 text-center text-4xl font-bold">Jobs</h2>

	{#if status === 'unlocked'}
		<div in:fade={{ duration: 300 }}>
			<ProjectList projects={localizedJobs} showHeading={false} />
		</div>
	{:else}
		<div class="mx-auto max-w-md text-center">
			<div class="mb-6">
				<Lock size={48} class="mx-auto mb-4 opacity-60" />
				<p>{t.locked}</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<input
						type="password"
						bind:value={password}
						placeholder={t.passwordPlaceholder}
						class="w-full border-2 border-black bg-white px-4 py-2 text-center dark:border-gray-500 dark:bg-gray-800 dark:text-white"
						disabled={status === 'loading'}
					/>
				</div>

				{#if errorMessage}
					<p class="text-red-600 dark:text-red-400" transition:fade={{ duration: 200 }}>
						{errorMessage}
					</p>
				{/if}

				<button
					type="submit"
					class="button-3d px-6 py-2 font-bold"
					disabled={status === 'loading'}
				>
					{#if status === 'loading'}
						{t.loading}
					{:else}
						<Unlock size={16} class="mr-1 inline-block" />
						{t.unlock}
					{/if}
				</button>
			</form>
		</div>
	{/if}
</section>
