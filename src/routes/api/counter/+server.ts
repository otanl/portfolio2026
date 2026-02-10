import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Redis } from '@upstash/redis';

const redis = new Redis({
	url: process.env.KV_REST_API_URL!,
	token: process.env.KV_REST_API_TOKEN!
});

const KEY = 'portfolio:counter';

export const GET: RequestHandler = async () => {
	const count = (await redis.get<number>(KEY)) ?? 0;
	return json({ count });
};

export const POST: RequestHandler = async () => {
	const count = await redis.incr(KEY);
	return json({ count });
};
