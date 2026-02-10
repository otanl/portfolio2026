import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { promises as fs } from 'fs';
import path from 'path';

const counterFilePath = path.join(process.cwd(), 'counter.txt');

async function getCount(): Promise<number> {
	try {
		const data = await fs.readFile(counterFilePath, 'utf-8');
		return parseInt(data, 10);
	} catch {
		return 0;
	}
}

async function setCount(count: number): Promise<void> {
	await fs.writeFile(counterFilePath, count.toString(), 'utf-8');
}

export const GET: RequestHandler = async () => {
	const count = await getCount();
	return json({ count });
};

export const POST: RequestHandler = async () => {
	let count = await getCount();
	count++;
	await setCount(count);
	return json({ count });
};
