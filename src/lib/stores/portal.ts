import { writable } from 'svelte/store';
import type { Project } from '$lib/types';

/** Shared camera rotation state for portal sync */
export const cameraState = writable<{
	position: [number, number, number];
	quaternion: [number, number, number, number];
} | null>(null);

/** Shared project selection state for portal sync */
export const projectSelection = writable<{
	selectedId: string | null;
	currentSlideIndex: Record<string, number>;
}>({
	selectedId: null,
	currentSlideIndex: {}
});

/** Style swap state: when true, main page gets neumorphic, portal gets retro */
export const styleSwapped = writable<boolean>(false);

/** Shared CSS editor state for portal windows */
export const cssEditorState = writable<{
	open: boolean;
	css: string;
}>({
	open: false,
	css: ''
});

/** Shared job section unlock state for portal sync */
export const jobState = writable<{
	status: 'locked' | 'loading' | 'unlocked' | 'error';
	jobs: Project[];
	errorMessage: string;
}>({
	status: 'locked',
	jobs: [],
	errorMessage: ''
});
