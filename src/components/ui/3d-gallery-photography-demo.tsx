'use client';

import React from 'react';
import InfiniteGallery from "@/components/ui/3d-gallery-photography";

export default function DemoOne() {
	const sampleImages = [
		{ src: 'https://cdn.21st.dev/assets/mirror/95/952b3b857ff14e4f91503879a7230d742e860ae4516f9dde3a505a4463c042e0.jpg', alt: 'Image 1' },
		{ src: 'https://cdn.21st.dev/assets/mirror/c6/c63e65818b6a3bae9a3fcc70204478ae64ba8a784ee3ece30b63240938225655.jpg', alt: 'Image 2' },
		{ src: 'https://cdn.21st.dev/assets/mirror/4b/4be49c7d2040e5588b22ac82a449e25f08f89bb69c6b528569cbea7fd963e3aa.jpg', alt: 'Image 3' },
		{ src: 'https://cdn.21st.dev/assets/mirror/eb/eb0ac0a8a2919d834c932802d63bd08e36503205928695a7261b3a2ad0ed4f9c.jpg', alt: 'Image 4' },
		{ src: 'https://cdn.21st.dev/assets/mirror/04/04281bdf07c83cc8477dedc5ada4f72964818de0bd06fa916a755df6f1054f68.jpg', alt: 'Image 5' },
		{ src: 'https://cdn.21st.dev/assets/mirror/5b/5bf1392386e3926240352cf21edc626753e268be3530ea563de58db86dbf7cc8.jpg', alt: 'Image 6' },
		{ src: 'https://cdn.21st.dev/assets/mirror/b9/b9bfe17ba11762604a7fadbf169fbf6b1021e62ee7ec4f6fa7ed9427017af908.jpg', alt: 'Image 7' },
		{ src: 'https://cdn.21st.dev/assets/mirror/51/51388b25912624d4b0d1cc8a87165e862f8fd32899da728c0ed6dce22fb7808c.jpg', alt: 'Image 8' },
	];

	return (
		<main className="min-h-screen h-full w-full relative bg-black">
			<InfiniteGallery
				images={sampleImages}
				speed={1.2}
				zSpacing={3}
				visibleCount={12}
				falloff={{ near: 0.8, far: 14 }}
				className="h-screen w-full rounded-lg overflow-hidden"
			>
				<div className="absolute inset-0 pointer-events-none flex items-center justify-center text-center px-3 mix-blend-difference text-white select-none z-10">
					<h1 className="font-abril italic text-5xl sm:text-7xl md:text-8xl tracking-tight mix-blend-difference">
						Shadway
					</h1>
				</div>

				<div className="text-center absolute bottom-10 left-0 right-0 font-mono uppercase text-[11px] font-semibold text-white/70 pointer-events-none z-10">
					<p>Use mouse wheel, arrow keys, or touch to navigate</p>
					<p className="opacity-60">
						Auto-play resumes after 3 seconds of inactivity
					</p>
				</div>
			</InfiniteGallery>
		</main>
	);
}
