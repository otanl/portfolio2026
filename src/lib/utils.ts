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

// --- Color helpers ---

export function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.replace('#', ''), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
}

export function lighten(hex: string, amount: number): string {
	const [r, g, b] = hexToRgb(hex);
	return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

export function darken(hex: string, amount: number): string {
	const [r, g, b] = hexToRgb(hex);
	return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** Returns black or white depending on background luminance */
export function contrastText(hex: string): string {
	const [r, g, b] = hexToRgb(hex);
	const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return lum > 0.5 ? '#000000' : '#ffffff';
}
