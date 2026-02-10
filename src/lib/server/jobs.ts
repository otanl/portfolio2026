import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Project } from '$lib/types';

const jobsDirectory = path.join(process.cwd(), 'src/content/jobs');

export function getJobs(): Project[] {
	const fileNames = fs.readdirSync(jobsDirectory);

	const jobs = fileNames
		.filter((fileName) => fileName.endsWith('.md'))
		.map((fileName) => {
			const slug = fileName.replace(/\.md$/, '');
			const fullPath = path.join(jobsDirectory, fileName);
			const fileContents = fs.readFileSync(fullPath, 'utf8');
			const { data, content } = matter(fileContents);

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

	return jobs;
}
