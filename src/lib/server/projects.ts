import matter from 'gray-matter';
import type { Project } from '$lib/types';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type { Project };

const mdModules = import.meta.glob('/src/content/projects/*.md', {
	query: '?raw',
	eager: true
}) as Record<string, { default: string }>;

function pickSmallestLocalImage(images: string[]): string | undefined {
	let smallest: { url: string; size: number } | undefined;

	for (const imageUrl of images) {
		if (!imageUrl.startsWith('/')) continue;

		const filePath = join(process.cwd(), 'static', imageUrl.slice(1));
		if (!existsSync(filePath)) continue;

		try {
			const size = statSync(filePath).size;
			if (!smallest || size < smallest.size) {
				smallest = { url: imageUrl, size };
			}
		} catch {
			// Ignore files that cannot be stat'ed and continue with remaining candidates.
		}
	}

	return smallest?.url;
}

export function getProjects(): Project[] {
	const projects = Object.entries(mdModules)
		.map(([filePath, mod]) => {
			const slug = filePath.split('/').pop()!.replace(/\.md$/, '');
			const { data, content } = matter(mod.default);

			let images: string[] = [];
			if (Array.isArray(data.images)) {
				images = data.images.filter((img: string) => img && img.length > 0);
			} else if (data.image) {
				images = [data.image];
			}

			return {
				slug,
				title: data.title || '',
				description: data.description || '',
				images,
				technologies: data.technologies || [],
				link: data.link || '#',
				content: content.trim(),
				embed: data.embed || undefined,
				videos: data.videos || [],
				thumbnail: data.thumbnail || pickSmallestLocalImage(images)
			} as Project;
		})
		.sort((a, b) => a.slug.localeCompare(b.slug));

	return projects;
}
