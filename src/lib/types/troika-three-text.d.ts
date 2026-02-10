declare module 'troika-three-text' {
	import { Mesh, Material, BufferGeometry, Box3 } from 'three';

	export interface TextGeometry extends BufferGeometry {
		boundingBox: Box3 | null;
	}

	export class Text extends Mesh {
		text: string;
		font: string | null;
		fontSize: number;
		color: string | number;
		maxWidth: number;
		lineHeight: number;
		letterSpacing: number;
		textAlign: 'left' | 'right' | 'center' | 'justify';
		anchorX: 'left' | 'center' | 'right' | number;
		anchorY: 'top' | 'top-baseline' | 'top-cap' | 'top-ex' | 'middle' | 'bottom-baseline' | 'bottom' | number;
		clipRect: [number, number, number, number] | null;
		depthOffset: number;
		direction: 'auto' | 'ltr' | 'rtl';
		overflowWrap: 'normal' | 'break-word';
		whiteSpace: 'normal' | 'nowrap';
		outlineWidth: number | string;
		outlineColor: string | number;
		outlineOpacity: number;
		outlineBlur: number | string;
		outlineOffsetX: number | string;
		outlineOffsetY: number | string;
		strokeWidth: number | string;
		strokeColor: string | number;
		strokeOpacity: number;
		fillOpacity: number;
		sdfGlyphSize: number | null;
		material: Material | Material[];
		geometry: TextGeometry;

		sync(callback?: () => void): void;
		dispose(): void;
	}

	export function preloadFont(
		options: {
			font: string;
			characters?: string;
			sdfGlyphSize?: number;
		},
		callback?: () => void
	): void;
}
