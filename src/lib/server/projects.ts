import matter from 'gray-matter';
import type { Project } from '$lib/types';

export type { Project };

const mdModules = import.meta.glob('/src/content/projects/*.md', {
	query: '?raw',
	eager: true
}) as Record<string, { default: string }>;

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
				thumbnail: data.thumbnail || undefined
			} as Project;
		})
		.sort((a, b) => a.slug.localeCompare(b.slug));

	return projects;
}
