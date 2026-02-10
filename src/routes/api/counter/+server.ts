import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from 'redis';

const KEY = 'portfolio:counter';

function getClient() {
	const client = createClient({ url: process.env.REDIS_URL });
	client.on('error', (err) => console.error('Redis error:', err));
	return client;
}

export const GET: RequestHandler = async () => {
	const client = getClient();
	try {
		await client.connect();
		const count = Number((await client.get(KEY)) ?? 0);
		return json({ count });
	} finally {
		await client.disconnect();
	}
};

export const POST: RequestHandler = async () => {
	const client = getClient();
	try {
		await client.connect();
		const count = await client.incr(KEY);
		return json({ count });
	} finally {
		await client.disconnect();
	}
};
