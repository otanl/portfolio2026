<script lang="ts">
	import { Send } from 'lucide-svelte';
	import { writable, type Writable } from 'svelte/store';

	interface Props {
		lang?: 'ja' | 'en';
		accessKey?: string;
	}

	let { lang = 'ja', accessKey = '' }: Props = $props();

	const t = $derived(lang === 'ja'
		? {
			subjectSuffix: 'さんからのお問い合わせ',
			successTitle: '送信完了しました！',
			successDesc: 'お問い合わせありがとうございます。',
			back: '戻る',
			name: 'お名前',
			namePlaceholder: '山田太郎',
			email: 'メールアドレス',
			message: 'メッセージ',
			messagePlaceholder: 'お問い合わせ内容をご記入ください',
			error: '送信に失敗しました。時間をおいて再度お試しください。',
			sending: '送信中...',
			send: '送信する'
		}
		: {
			subjectSuffix: 'sent a message from portfolio',
			successTitle: 'Message sent!',
			successDesc: 'Thank you for your inquiry.',
			back: 'Back',
			name: 'Name',
			namePlaceholder: 'John Doe',
			email: 'Email',
			message: 'Message',
			messagePlaceholder: 'Please enter your message',
			error: 'Failed to send. Please try again later.',
			sending: 'Sending...',
			send: 'Send'
		}
	);

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
					subject: `[Portfolio] ${formState.name} ${t.subjectSuffix}`
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
			<p class="text-lg font-bold">{t.successTitle}</p>
			<p class="mt-2 text-sm">{t.successDesc}</p>
			<button class="button-3d mt-4 px-4 py-2" onclick={resetForm}>
				{t.back}
			</button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="contact-name" class="mb-1 block text-sm font-bold">{t.name}</label>
				<input
					id="contact-name"
					type="text"
					value={formState.name}
					oninput={(e) => updateField('name', e.currentTarget.value)}
					required
					placeholder={t.namePlaceholder}
					class="w-full border-2 border-black px-3 py-2"
				/>
			</div>
			<div>
				<label for="contact-email" class="mb-1 block text-sm font-bold">{t.email}</label>
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
				<label for="contact-message" class="mb-1 block text-sm font-bold">{t.message}</label>
				<textarea
					id="contact-message"
					value={formState.message}
					oninput={(e) => updateField('message', e.currentTarget.value)}
					required
					rows={4}
					placeholder={t.messagePlaceholder}
					class="w-full border-2 border-black px-3 py-2"
				></textarea>
			</div>

			{#if formState.status === 'error'}
				<p class="text-sm text-red-600">{t.error}</p>
			{/if}

			<button
				type="submit"
				class="button-3d flex w-full items-center justify-center gap-2 px-4 py-2"
				disabled={formState.status === 'sending'}
			>
				<Send size={16} />
				{formState.status === 'sending' ? t.sending : t.send}
			</button>
		</form>
	{/if}
</div>
