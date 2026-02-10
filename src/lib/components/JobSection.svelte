<script lang="ts">
	import { Lock, Unlock } from 'lucide-svelte';
	import { slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Project } from '$lib/types';
	import ProjectList from './ProjectList.svelte';
	import { jobState } from '$lib/stores/portal';

	let password = $state('');

	// Use shared store so retro and portal instances stay in sync
	let status = $derived($jobState.status);
	let jobs = $derived($jobState.jobs);
	let errorMessage = $derived($jobState.errorMessage);

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
					errorMessage: data.error || 'パスワードが違います'
				}));
			}
		} catch {
			jobState.update(s => ({
				...s,
				status: 'error',
				errorMessage: '通信エラーが発生しました'
			}));
		}
	}
</script>

<section id="jobs" class="py-20">
	<h2 class="mb-12 text-center text-4xl font-bold">Jobs</h2>

	{#if status === 'unlocked'}
		<div in:fade={{ duration: 300 }}>
			<ProjectList projects={jobs} showHeading={false} />
		</div>
	{:else}
		<div class="mx-auto max-w-md text-center">
			<div class="mb-6">
				<Lock size={48} class="mx-auto mb-4 opacity-60" />
				<p>このセクションはパスワードで保護されています。</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<input
						type="password"
						bind:value={password}
						placeholder="パスワードを入力"
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
						認証中...
					{:else}
						<Unlock size={16} class="mr-1 inline-block" />
						ロック解除
					{/if}
				</button>
			</form>
		</div>
	{/if}
</section>
