<script lang="ts">
	import { Send } from 'lucide-svelte';
	import { writable, type Writable } from 'svelte/store';

	interface Props {
		accessKey?: string;
	}

	let { accessKey = '' }: Props = $props();

	type FormState = {
		name: string;
		email: string;
		message: string;
		status: 'idle' | 'sending' | 'success' | 'error';
	};

	// Shared store so both retro and neumorphism views stay in sync
	function getSharedState(): Writable<FormState> {
		if (typeof globalThis !== 'undefined' && !(globalThis as any).__contactFormState) {
			(globalThis as any).__contactFormState = writable<FormState>({
				name: '', email: '', message: '', status: 'idle'
			});
		}
		return (globalThis as any).__contactFormState;
	}

	const sharedState = getSharedState();

	let formState: FormState = $state({ name: '', email: '', message: '', status: 'idle' });

	sharedState.subscribe((v) => {
		formState = v;
	});

	function updateField(field: 'name' | 'email' | 'message', value: string) {
		sharedState.update((s) => ({ ...s, [field]: value }));
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!accessKey) {
			sharedState.update((s) => ({ ...s, status: 'error' as const }));
			return;
		}

		sharedState.update((s) => ({ ...s, status: 'sending' as const }));

		try {
			const res = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					access_key: accessKey,
					name: formState.name,
					email: formState.email,
					message: formState.message,
					subject: `[Portfolio] ${formState.name}さんからのお問い合わせ`
				})
			});

			if (res.ok) {
				sharedState.set({ name: '', email: '', message: '', status: 'success' });
			} else {
				sharedState.update((s) => ({ ...s, status: 'error' as const }));
			}
		} catch {
			sharedState.update((s) => ({ ...s, status: 'error' as const }));
		}
	}

	function resetForm() {
		sharedState.set({ name: '', email: '', message: '', status: 'idle' });
	}
</script>

<div class="mx-auto mt-6 max-w-md text-left">
	{#if formState.status === 'success'}
		<div class="retro-card p-4 text-center">
			<p class="text-lg font-bold">送信完了しました！</p>
			<p class="mt-2 text-sm">お問い合わせありがとうございます。</p>
			<button class="button-3d mt-4 px-4 py-2" onclick={resetForm}>
				戻る
			</button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="contact-name" class="mb-1 block text-sm font-bold">お名前</label>
				<input
					id="contact-name"
					type="text"
					value={formState.name}
					oninput={(e) => updateField('name', e.currentTarget.value)}
					required
					placeholder="山田太郎"
					class="w-full border-2 border-black px-3 py-2"
				/>
			</div>
			<div>
				<label for="contact-email" class="mb-1 block text-sm font-bold">メールアドレス</label>
				<input
					id="contact-email"
					type="email"
					value={formState.email}
					oninput={(e) => updateField('email', e.currentTarget.value)}
					required
					placeholder="example@mail.com"
					class="w-full border-2 border-black px-3 py-2"
				/>
			</div>
			<div>
				<label for="contact-message" class="mb-1 block text-sm font-bold">メッセージ</label>
				<textarea
					id="contact-message"
					value={formState.message}
					oninput={(e) => updateField('message', e.currentTarget.value)}
					required
					rows={4}
					placeholder="お問い合わせ内容をご記入ください"
					class="w-full border-2 border-black px-3 py-2"
				></textarea>
			</div>

			{#if formState.status === 'error'}
				<p class="text-sm text-red-600">送信に失敗しました。時間をおいて再度お試しください。</p>
			{/if}

			<button
				type="submit"
				class="button-3d flex w-full items-center justify-center gap-2 px-4 py-2"
				disabled={formState.status === 'sending'}
			>
				<Send size={16} />
				{formState.status === 'sending' ? '送信中...' : '送信する'}
			</button>
		</form>
	{/if}
</div>
