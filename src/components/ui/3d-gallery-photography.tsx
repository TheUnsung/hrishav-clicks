'use client';

import type React from 'react';
import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export type ImageItem = string | { src: string; alt?: string };

export interface FadeSettings {
	fadeIn: {
		start: number;
		end: number;
	};
	fadeOut: {
		start: number;
		end: number;
	};
}

export interface BlurSettings {
	blurIn: {
		start: number;
		end: number;
	};
	blurOut: {
		start: number;
		end: number;
	};
	maxBlur: number;
}

export interface InfiniteGalleryProps {
	images: ImageItem[];
	speed?: number;
	zSpacing?: number;
	visibleCount?: number;
	falloff?: { near: number; far: number };
	fadeSettings?: FadeSettings;
	blurSettings?: BlurSettings;
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
}

interface PlaneData {
	index: number;
	z: number;
	imageIndex: number;
	x: number;
	y: number; 
}

const DEFAULT_DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

const createClothMaterial = () => {
	return new THREE.ShaderMaterial({
		transparent: true,
		uniforms: {
			map: { value: null },
			opacity: { value: 1.0 },
			blurAmount: { value: 0.0 },
			scrollForce: { value: 0.0 },
			time: { value: 0.0 },
			isHovered: { value: 0.0 },
		},
		vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normal;
        
        vec3 pos = position;
        
        // Create smooth curving based on scroll force
        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        
        // Gentle cloth-like ripples
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;
        
        // Gentle, subtle cloth ripple when hovered
        float hoverWave = 0.0;
        if (isHovered > 0.001) {
          float speed = time * 3.0;
          float w1 = sin(pos.x * 4.0 - speed) * 0.055;
          float w2 = cos(pos.y * 3.5 + speed * 0.8) * 0.035;
          float w3 = sin((pos.x + pos.y) * 3.0 - speed * 1.0) * 0.025;
          hoverWave = (w1 + w2 + w3) * isHovered;
        }
        
        // Apply Z displacement
        pos.z += hoverWave - (curve + clothEffect);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
		fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      uniform float isHovered;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vec4 color = texture2D(map, vUv);
        
        // Simple blur approximation
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }
        
        // Add subtle lighting effect based on curving
        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);

        // Subtle specular sheen on wave crests when hovered
        if (isHovered > 0.001) {
          float waveHighlight = sin(vUv.x * 6.0 - time * 3.0) * 0.03 * isHovered;
          color.rgb += vec3(waveHighlight);
        }
        
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
	});
};

function ImagePlane({
	texture,
	position,
	scale,
	material,
}: {
	texture: THREE.Texture;
	position: [number, number, number];
	scale: [number, number, number];
	material: THREE.ShaderMaterial;
}) {
	const meshRef = useRef<THREE.Mesh>(null);
	const [hovered, setHovered] = useState(false);
	const currentHover = useRef(0);

	useEffect(() => {
		if (material && texture) {
			material.uniforms.map.value = texture;
		}
	}, [material, texture]);

	useFrame((_, delta) => {
		// Smoothly ease hover intensity in and out
		const target = hovered ? 1.0 : 0.0;
		currentHover.current = THREE.MathUtils.damp(
			currentHover.current,
			target,
			6,
			delta
		);

		if (material && material.uniforms) {
			material.uniforms.isHovered.value = currentHover.current;
		}

		if (meshRef.current) {
			// Subtle, calm scale boost on hover (1.5%)
			const scaleBoost = 1.0 + currentHover.current * 0.015;
			meshRef.current.scale.x = scale[0] * scaleBoost;
			meshRef.current.scale.y = scale[1] * scaleBoost;
		}
	});

	return (
		<mesh
			ref={meshRef}
			position={position}
			scale={scale}
			material={material}
			onPointerOver={(e) => {
				e.stopPropagation();
				setHovered(true);
				document.body.style.cursor = 'pointer';
			}}
			onPointerOut={() => {
				setHovered(false);
				document.body.style.cursor = '';
			}}
		>
			<planeGeometry args={[1, 1, 48, 48]} />
		</mesh>
	);
}

function GalleryScene({
	images,
	speed = 1,
	visibleCount = 8,
	fadeSettings = {
		fadeIn: { start: 0.05, end: 0.15 },
		fadeOut: { start: 0.85, end: 0.95 },
	},
	blurSettings = {
		blurIn: { start: 0.0, end: 0.1 },
		blurOut: { start: 0.9, end: 1.0 },
		maxBlur: 3.0,
	},
}: Omit<InfiniteGalleryProps, 'className' | 'style'>) {
	const { gl } = useThree();
	const [scrollVelocity, setScrollVelocity] = useState(0);
	const [autoPlay, setAutoPlay] = useState(true);
	const lastInteraction = useRef(Date.now());

	const normalizedImages = useMemo(
		() =>
			images.map((img) =>
				typeof img === 'string' ? { src: img, alt: '' } : img
			),
		[images]
	);

	const textures = useTexture(normalizedImages.map((img) => img.src));

	// Notify preloader that all 3D gallery photo textures are decoded and loaded into GPU
	useEffect(() => {
		if (textures && textures.length > 0) {
			window.dispatchEvent(new CustomEvent('gallery-ready'));
		}
	}, [textures]);

	// Create materials pool
	const materials = useMemo(
		() => Array.from({ length: visibleCount }, () => createClothMaterial()),
		[visibleCount]
	);

	const spatialPositions = useMemo(() => {
		const positions: { x: number; y: number }[] = [];
		const maxHorizontalOffset = MAX_HORIZONTAL_OFFSET;
		const maxVerticalOffset = MAX_VERTICAL_OFFSET;

		for (let i = 0; i < visibleCount; i++) {
			// Create varied distribution patterns for both axes
			const horizontalAngle = (i * 2.618) % (Math.PI * 2); // Golden angle for natural distribution
			const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2); // Offset angle for vertical

			const horizontalRadius = (i % 3) * 1.2; // Vary the distance from center
			const verticalRadius = ((i + 1) % 4) * 0.8; // Different pattern for vertical

			const x =
				(Math.sin(horizontalAngle) * horizontalRadius * maxHorizontalOffset) /
				3;
			const y =
				(Math.cos(verticalAngle) * verticalRadius * maxVerticalOffset) / 4;

			positions.push({ x, y });
		}

		return positions;
	}, [visibleCount]);

	const totalImages = normalizedImages.length;
	const depthRange = DEFAULT_DEPTH_RANGE;

	// Initialize plane data
	const planesData = useRef<PlaneData[]>(
		Array.from({ length: visibleCount }, (_, i) => ({
			index: i,
			z: visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0,
			imageIndex: totalImages > 0 ? i % totalImages : 0,
			x: spatialPositions[i]?.x ?? 0,
			y: spatialPositions[i]?.y ?? 0,
		}))
	);

	useEffect(() => {
		planesData.current = Array.from({ length: visibleCount }, (_, i) => ({
			index: i,
			z:
				visibleCount > 0
					? ((depthRange / Math.max(visibleCount, 1)) * i) % depthRange
					: 0,
			imageIndex: totalImages > 0 ? i % totalImages : 0,
			x: spatialPositions[i]?.x ?? 0,
			y: spatialPositions[i]?.y ?? 0,
		}));
	}, [depthRange, spatialPositions, totalImages, visibleCount]);

	// Handle scroll input
	const handleWheel = useCallback(
		(event: WheelEvent) => {
			event.preventDefault();
			const delta =
				Math.abs(event.deltaY) >= Math.abs(event.deltaX)
					? event.deltaY
					: event.deltaX;
			setScrollVelocity((prev) => prev + delta * 0.012 * speed);
			setAutoPlay(false);
			lastInteraction.current = Date.now();
		},
		[speed]
	);

	// Mouse drag support for desktop
	const isDragging = useRef(false);
	const dragLastY = useRef(0);
	const dragLastX = useRef(0);

	const handleMouseDown = useCallback((e: MouseEvent) => {
		if (e.button !== 0) return;
		isDragging.current = true;
		dragLastY.current = e.clientY;
		dragLastX.current = e.clientX;
		setAutoPlay(false);
		lastInteraction.current = Date.now();
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging.current) return;
			const dy = dragLastY.current - e.clientY;
			const dx = dragLastX.current - e.clientX;
			dragLastY.current = e.clientY;
			dragLastX.current = e.clientX;

			const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
			setScrollVelocity((prev) => prev + delta * 0.035 * speed);
			setAutoPlay(false);
			lastInteraction.current = Date.now();
		},
		[speed]
	);

	const handleMouseUp = useCallback(() => {
		isDragging.current = false;
	}, []);

	// Handle keyboard input
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
				setScrollVelocity((prev) => prev - 2 * speed);
				setAutoPlay(false);
				lastInteraction.current = Date.now();
			} else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
				setScrollVelocity((prev) => prev + 2 * speed);
				setAutoPlay(false);
				lastInteraction.current = Date.now();
			}
		},
		[speed]
	);

	// Touch drag state — horizontal swipe for mobile
	const touchStartY = useRef<number | null>(null);
	const touchLastY = useRef<number | null>(null);
	const touchStartX = useRef<number | null>(null);
	const touchLastX = useRef<number | null>(null);

	const handleTouchStart = useCallback((e: TouchEvent) => {
		touchStartY.current = e.touches[0].clientY;
		touchLastY.current = e.touches[0].clientY;
		touchStartX.current = e.touches[0].clientX;
		touchLastX.current = e.touches[0].clientX;
		setAutoPlay(false);
		lastInteraction.current = Date.now();
	}, []);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			const isMobile = window.innerWidth < 768;
			if (isMobile) {
				// Horizontal swipe on mobile (prevents accidental gallery scroll during vertical page scrolling)
				if (touchLastX.current === null || touchLastY.current === null) return;
				const currentX = e.touches[0].clientX;
				const currentY = e.touches[0].clientY;
				const dx = touchLastX.current - currentX;
				const dy = touchLastY.current - currentY;
				touchLastX.current = currentX;
				touchLastY.current = currentY;

				// Only advance gallery if swipe is predominantly horizontal
				if (Math.abs(dx) >= Math.abs(dy) * 0.8) {
					setScrollVelocity((prev) => prev + dx * 0.035 * speed);
					setAutoPlay(false);
					lastInteraction.current = Date.now();
				}
			} else {
				// Vertical swipe on desktop/tablet touchscreens
				if (touchLastY.current === null) return;
				const dy = touchLastY.current - e.touches[0].clientY;
				touchLastY.current = e.touches[0].clientY;
				setScrollVelocity((prev) => prev + dy * 0.03 * speed);
				setAutoPlay(false);
				lastInteraction.current = Date.now();
			}
		},
		[speed]
	);

	const handleTouchEnd = useCallback(() => {
		touchStartY.current = null;
		touchLastY.current = null;
		touchStartX.current = null;
		touchLastX.current = null;
	}, []);

	useEffect(() => {
		const canvas = gl.domElement;
		if (canvas) {
			canvas.style.touchAction = 'pan-y';
			canvas.addEventListener('wheel', handleWheel, { passive: false });
			canvas.addEventListener('mousedown', handleMouseDown);
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);
			canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
			canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
			canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
			canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });
			document.addEventListener('keydown', handleKeyDown);

			return () => {
				canvas.removeEventListener('wheel', handleWheel);
				canvas.removeEventListener('mousedown', handleMouseDown);
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
				canvas.removeEventListener('touchstart', handleTouchStart);
				canvas.removeEventListener('touchmove', handleTouchMove);
				canvas.removeEventListener('touchend', handleTouchEnd);
				canvas.removeEventListener('touchcancel', handleTouchEnd);
				document.removeEventListener('keydown', handleKeyDown);
			};
		}
	}, [gl, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd]);

	// Auto-play logic
	useEffect(() => {
		const interval = setInterval(() => {
			if (Date.now() - lastInteraction.current > 3000) {
				setAutoPlay(true);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useFrame((state, delta) => {
		// Apply auto-play
		if (autoPlay) {
			setScrollVelocity((prev) => prev + 0.3 * delta);
		}

		// Damping
		setScrollVelocity((prev) => prev * 0.95);

		// Update time uniform for all materials
		const time = state.clock.getElapsedTime();
		materials.forEach((material) => {
			if (material && material.uniforms) {
				material.uniforms.time.value = time;
				material.uniforms.scrollForce.value = scrollVelocity;
			}
		});

		// Update plane positions
		const imageAdvance =
			totalImages > 0 ? visibleCount % totalImages || totalImages : 0;
		const totalRange = depthRange;
		const halfRange = totalRange / 2;

		planesData.current.forEach((plane, i) => {
			let newZ = plane.z + scrollVelocity * delta * 10;
			let wrapsForward = 0;
			let wrapsBackward = 0;

			if (newZ >= totalRange) {
				wrapsForward = Math.floor(newZ / totalRange);
				newZ -= totalRange * wrapsForward;
			} else if (newZ < 0) {
				wrapsBackward = Math.ceil(-newZ / totalRange);
				newZ += totalRange * wrapsBackward;
			}

			if (wrapsForward > 0 && imageAdvance > 0 && totalImages > 0) {
				plane.imageIndex =
					(plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
			}

			if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
				const step = plane.imageIndex - wrapsBackward * imageAdvance;
				plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
			}

			plane.z = ((newZ % totalRange) + totalRange) % totalRange;
			plane.x = spatialPositions[i]?.x ?? 0;
			plane.y = spatialPositions[i]?.y ?? 0;

			const worldZ = plane.z - halfRange;

			// Calculate opacity based on fade settings
			const normalizedPosition = plane.z / totalRange; // 0 to 1
			let opacity = 1;

			if (
				normalizedPosition >= fadeSettings.fadeIn.start &&
				normalizedPosition <= fadeSettings.fadeIn.end
			) {
				const fadeInProgress =
					(normalizedPosition - fadeSettings.fadeIn.start) /
					(fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
				opacity = fadeInProgress;
			} else if (normalizedPosition < fadeSettings.fadeIn.start) {
				opacity = 0;
			} else if (
				normalizedPosition >= fadeSettings.fadeOut.start &&
				normalizedPosition <= fadeSettings.fadeOut.end
			) {
				const fadeOutProgress =
					(normalizedPosition - fadeSettings.fadeOut.start) /
					(fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
				opacity = 1 - fadeOutProgress;
			} else if (normalizedPosition > fadeSettings.fadeOut.end) {
				opacity = 0;
			}

			opacity = Math.max(0, Math.min(1, opacity));

			// Calculate blur based on blur settings
			let blur = 0;

			if (
				normalizedPosition >= blurSettings.blurIn.start &&
				normalizedPosition <= blurSettings.blurIn.end
			) {
				const blurInProgress =
					(normalizedPosition - blurSettings.blurIn.start) /
					(blurSettings.blurIn.end - blurSettings.blurIn.start);
				blur = blurSettings.maxBlur * (1 - blurInProgress);
			} else if (normalizedPosition < blurSettings.blurIn.start) {
				blur = blurSettings.maxBlur;
			} else if (
				normalizedPosition >= blurSettings.blurOut.start &&
				normalizedPosition <= blurSettings.blurOut.end
			) {
				const blurOutProgress =
					(normalizedPosition - blurSettings.blurOut.start) /
					(blurSettings.blurOut.end - blurSettings.blurOut.start);
				blur = blurSettings.maxBlur * blurOutProgress;
			} else if (normalizedPosition > blurSettings.blurOut.end) {
				blur = blurSettings.maxBlur;
			}

			blur = Math.max(0, Math.min(blurSettings.maxBlur, blur));

			const material = materials[i];
			if (material && material.uniforms) {
				material.uniforms.opacity.value = opacity;
				material.uniforms.blurAmount.value = blur;
			}
		});
	});

	if (normalizedImages.length === 0) return null;

	return (
		<>
			{planesData.current.map((plane, i) => {
				const texture = textures[plane.imageIndex];
				const material = materials[i];

				if (!texture || !material) return null;

				const worldZ = plane.z - depthRange / 2;

				const aspect = texture.image
					? texture.image.width / texture.image.height
					: 1;
				const scale: [number, number, number] =
					aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];

				return (
					<ImagePlane
						key={plane.index}
						texture={texture}
						position={[plane.x, plane.y, worldZ]}
						scale={scale}
						material={material}
					/>
				);
			})}
		</>
	);
}

function FallbackGallery({ images }: { images: ImageItem[] }) {
	const normalizedImages = useMemo(
		() =>
			images.map((img) =>
				typeof img === 'string' ? { src: img, alt: '' } : img
			),
		[images]
	);

	return (
		<div className="flex flex-col items-center justify-center h-full bg-black/60 p-4">
			<p className="text-white/60 mb-4 text-xs font-mono">
				WebGL initializing or not supported. Showing image preview:
			</p>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
				{normalizedImages.map((img, i) => (
					<img
						key={i}
						src={img.src || '/placeholder.svg'}
						alt={img.alt}
						className="w-full h-32 object-cover rounded-xl border border-white/10"
					/>
				))}
			</div>
		</div>
	);
}

export default function InfiniteGallery({
	images,
	className = 'h-96 w-full',
	style,
	children,
	fadeSettings = {
		fadeIn: { start: 0.05, end: 0.25 },
		fadeOut: { start: 0.4, end: 0.43 },
	},
	blurSettings = {
		blurIn: { start: 0.0, end: 0.1 },
		blurOut: { start: 0.4, end: 0.43 },
		maxBlur: 8.0,
	},
}: InfiniteGalleryProps) {
	const [webglSupported, setWebglSupported] = useState(true);

	useEffect(() => {
		try {
			const canvas = document.createElement('canvas');
			const gl =
				canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) {
				setWebglSupported(false);
			}
		} catch (e) {
			setWebglSupported(false);
		}
	}, []);

	if (!webglSupported) {
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('gallery-ready'));
		}
		return (
			<div className={className} style={style}>
				<FallbackGallery images={images} />
				{children}
			</div>
		);
	}

	return (
		<div className={className} style={style}>
			<Canvas
				camera={{ position: [0, 0, 0], fov: 55 }}
				gl={{ antialias: true, alpha: false }}
			>
				<color attach="background" args={['#000000']} />
				<GalleryScene
					images={images}
					fadeSettings={fadeSettings}
					blurSettings={blurSettings}
				/>
			</Canvas>
			{children}
		</div>
	);
}
