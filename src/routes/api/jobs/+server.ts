import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getJobs } from '$lib/server/jobs';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	const { password } = await request.json();

	if (!env.JOB_PASSWORD) {
		return json({ error: 'パスワードが設定されていません' }, { status: 500 });
	}

	if (password !== env.JOB_PASSWORD) {
		return json({ error: 'パスワードが違います' }, { status: 401 });
	}

	const jobs = getJobs();
	return json({ jobs });
};
