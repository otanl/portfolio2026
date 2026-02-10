<script lang="ts">
	import { T, Canvas } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import CameraSync from './CameraSync.svelte';
	import * as THREE from 'three';
	import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
	import { FontLoader, type Font } from 'three/addons/loaders/FontLoader.js';
	import { onMount } from 'svelte';

	interface Props {
		text: string;
		fontPath: string;
		follower?: boolean;
	}

	let { text, fontPath, follower = false }: Props = $props();

	let textSize = $state(4.5);
	let font = $state<Font | null>(null);
	let geometry = $state<TextGeometry | null>(null);

	// 虹色シェーダー（フロント面用）
	const frontMaterial = new THREE.ShaderMaterial({
		vertexShader: `
			varying vec3 vOriginalPosition;
			void main() {
				vOriginalPosition = position;
				vec3 skewedPosition = position;
				float skewFactor = 0.8;
				skewedPosition.y += skewedPosition.z * skewFactor;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(skewedPosition, 1.0);
			}
		`,
		fragmentShader: `
			varying vec3 vOriginalPosition;
			vec3 hsl2rgb(vec3 c) {
				vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
				return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
			}
			void main() {
				float hue = mod(vOriginalPosition.x * 0.01, 1.0);
				vec3 color = hsl2rgb(vec3(hue, 1.0, 0.5));
				gl_FragColor = vec4(color, 1.0);
			}
		`
	});

	// サイド面用マテリアル（グレー）
	const sideMaterial = new THREE.ShaderMaterial({
		vertexShader: `
			varying vec3 vOriginalPosition;
			void main() {
				vOriginalPosition = position;
				vec3 skewedPosition = position;
				float skewFactor = 0.8;
				skewedPosition.y += skewedPosition.z * skewFactor;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(skewedPosition, 1.0);
			}
		`,
		fragmentShader: `
			void main() {
				gl_FragColor = vec4(0.6, 0.6, 0.6, 1.0);
			}
		`
	});

	function createGeometry(loadedFont: Font, size: number) {
		const geo = new TextGeometry(text, {
			font: loadedFont,
			size: size,
			depth: 1.0,
			bevelEnabled: true,
			bevelSize: 0.1,
			bevelThickness: 0.2
		});

		// ジオメトリを中央揃え
		geo.computeBoundingBox();
		if (geo.boundingBox) {
			const centerX = (geo.boundingBox.max.x - geo.boundingBox.min.x) / 2;
			const centerY = (geo.boundingBox.max.y - geo.boundingBox.min.y) / 2;
			geo.translate(-centerX, -centerY, 0);
		}

		return geo;
	}

	let containerEl: HTMLElement | null = null;

	function getTextSizeFromWidth(width: number): number {
		if (width < 400) return 2.5;
		if (width < 550) return 3.0;
		if (width < 700) return 3.5;
		if (width < 900) return 4.0;
		return 4.5;
	}

	export function setContainer(el: HTMLElement) {
		containerEl = el;
	}

	onMount(() => {
		// コンテナ幅ベースのレスポンシブ対応
		const canvas = document.querySelector('canvas')?.closest('.word-art-container') as HTMLElement | null;
		const target = containerEl || canvas?.parentElement || document.body;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const newSize = getTextSizeFromWidth(entry.contentRect.width);
				if (newSize !== textSize) {
					textSize = newSize;
					if (font) {
						geometry = createGeometry(font, textSize);
					}
				}
			}
		});
		observer.observe(target);

		// フォントを読み込み
		const loader = new FontLoader();
		loader.load(
			fontPath,
			(loadedFont) => {
				font = loadedFont;
				geometry = createGeometry(loadedFont, textSize);
			},
			undefined,
			(error) => {
				console.error('Failed to load font:', error);
			}
		);

		return () => observer.disconnect();
	});
</script>

<Canvas>
	<T.PerspectiveCamera makeDefault position={[0, 0, 20]} fov={70}>
		{#if !follower}
			<OrbitControls enableZoom={false} enablePan={false} />
		{/if}
	</T.PerspectiveCamera>

	<CameraSync leader={!follower} />

	<T.AmbientLight intensity={1.2} />
	<T.PointLight position={[10, 10, 20]} intensity={1.5} />
	<T.PointLight position={[-10, -5, 15]} intensity={0.8} color="#ffdddd" />

	{#if geometry}
		<T.Mesh {geometry} material={[frontMaterial, sideMaterial]} />
	{/if}
</Canvas>
