import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// 低解像度画像URLを生成
export function getLowResUrl(url: string): string {
	if (!url) return '';
	if (url.startsWith('/')) return url;
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}w=100&q=15`;
}

// MarkdownリンクをHTMLに変換
export function parseMarkdownLinks(text: string): string {
	return text
		.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>'
		)
		.replace(/\n/g, '<br>');
}

// YouTube URLを埋め込みURLに変換
export function getYouTubeEmbedUrl(url: string): string | null {
	// 再生リスト
	const playlistMatch = url.match(/youtube\.com\/playlist\?list=([^&]+)/);
	if (playlistMatch) {
		return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
	}

	// 個別動画
	const patterns = [
		/youtube\.com\/watch\?v=([^&]+)/,
		/youtube\.com\/live\/([^?]+)/,
		/youtu\.be\/([^?]+)/,
		/youtube\.com\/embed\/([^?]+)/
	];
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) {
			return `https://www.youtube.com/embed/${match[1]}`;
		}
	}
	return null;
}

// YouTube URLからサムネイルURLを取得
export function getYouTubeThumbnailUrl(url: string): string | null {
	const patterns = [
		/youtube\.com\/watch\?v=([^&]+)/,
		/youtube\.com\/live\/([^?]+)/,
		/youtu\.be\/([^?]+)/,
		/youtube\.com\/embed\/([^?]+)/
	];
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) {
			return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
		}
	}
	return null;
}
