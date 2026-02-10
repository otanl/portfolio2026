<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { cameraState } from '$lib/stores/portal';
	import { get } from 'svelte/store';

	interface Props {
		leader?: boolean;
	}

	let { leader = true }: Props = $props();

	const { camera } = useThrelte();

	useTask(() => {
		const cam = camera.current;
		if (!cam) return;

		if (leader) {
			cameraState.set({
				position: cam.position.toArray() as [number, number, number],
				quaternion: cam.quaternion.toArray() as [number, number, number, number]
			});
		} else {
			const state = get(cameraState);
			if (state) {
				cam.position.fromArray(state.position);
				cam.quaternion.fromArray(state.quaternion);
			}
		}
	});
</script>
