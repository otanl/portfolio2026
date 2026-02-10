import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getJobs } from '$lib/server/jobs';
import { JOB_PASSWORD } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const { password } = await request.json();

	if (!JOB_PASSWORD) {
		return json({ error: 'パスワードが設定されていません' }, { status: 500 });
	}

	if (password !== JOB_PASSWORD) {
		return json({ error: 'パスワードが違います' }, { status: 401 });
	}

	const jobs = getJobs();
	return json({ jobs });
};
