<script lang="ts">
	import { Send } from 'lucide-svelte';

	interface Props {
		accessKey?: string;
	}

	let { accessKey = '' }: Props = $props();

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let status = $state<'idle' | 'sending' | 'success' | 'error'>('idle');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!accessKey) {
			status = 'error';
			return;
		}

		status = 'sending';

		try {
			const res = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					access_key: accessKey,
					name,
					email,
					message,
					subject: `[Portfolio] ${name}さんからのお問い合わせ`
				})
			});

			if (res.ok) {
				status = 'success';
				name = '';
				email = '';
				message = '';
			} else {
				status = 'error';
			}
		} catch {
			status = 'error';
		}
	}
</script>

<div class="mx-auto mt-6 max-w-md text-left">
	{#if status === 'success'}
		<div class="retro-card p-4 text-center">
			<p class="text-lg font-bold">送信完了しました！</p>
			<p class="mt-2 text-sm">お問い合わせありがとうございます。</p>
			<button class="button-3d mt-4 px-4 py-2" onclick={() => (status = 'idle')}>
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
					bind:value={name}
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
					bind:value={email}
					required
					placeholder="example@mail.com"
					class="w-full border-2 border-black px-3 py-2"
				/>
			</div>
			<div>
				<label for="contact-message" class="mb-1 block text-sm font-bold">メッセージ</label>
				<textarea
					id="contact-message"
					bind:value={message}
					required
					rows={4}
					placeholder="お問い合わせ内容をご記入ください"
					class="w-full border-2 border-black px-3 py-2"
				></textarea>
			</div>

			{#if status === 'error'}
				<p class="text-sm text-red-600">送信に失敗しました。時間をおいて再度お試しください。</p>
			{/if}

			<button
				type="submit"
				class="button-3d flex w-full items-center justify-center gap-2 px-4 py-2"
				disabled={status === 'sending'}
			>
				<Send size={16} />
				{status === 'sending' ? '送信中...' : '送信する'}
			</button>
		</form>
	{/if}
</div>
