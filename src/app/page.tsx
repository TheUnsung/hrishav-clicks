'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import InfiniteGallery from '@/components/ui/3d-gallery-photography';
import type { WorksWheelItem } from '@/components/ui/works-wheel';
import { Aperture, Mail, ArrowUp, Sliders, Maximize2, Sparkles, Grid, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { LimelightNav, NavItem } from '@/components/ui/limelight-nav';
import { LiquidGlassCarousel } from '@/components/ui/liquid-glass-carousel';
import initialPhotos from '@/data/photos.json';

const worksData: WorksWheelItem[] = [
  {
    title: 'Golden Hour',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    href: '#golden-hour',
  },
  {
    title: 'Urban Geometry',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    href: '#urban-geometry',
  },
  {
    title: 'Morning Mist',
    image: 'https://images.unsplash.com/photo-1518173946687-a1e0e227b966?w=800&q=80',
    href: '#morning-mist',
  },
  {
    title: 'City Lights',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80',
    href: '#city-lights',
  },
  {
    title: 'Coastal Serenity',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    href: '#coastal-serenity',
  },
  {
    title: 'Whispered Bloom',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80',
    href: '#whispered-bloom',
  },
  {
    title: 'Mountain Peak',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    href: '#mountain-peak',
  },
  {
    title: 'The Wanderer',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
    href: '#the-wanderer',
  },
  {
    title: 'Stargazer',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
    href: '#stargazer',
  },
  {
    title: 'Alpine Dawn',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
    href: '#alpine-dawn',
  },
];

// ─── Grid portfolio items ────────────────────────────────────────────────────

interface PortfolioImage {
  src: string;
  alt: string;
  category: string;
  title: string;
  aspect: 'tall' | 'wide' | 'square';
}

const portfolioImages: PortfolioImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
    alt: 'Sunlit valley with winding river through green mountains',
    category: 'Landscape',
    title: 'Valley of Light',
    aspect: 'tall',
  },
  {
    src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
    alt: 'City skyline reflecting on water at twilight',
    category: 'Urban',
    title: 'Twilight Skyline',
    aspect: 'wide',
  },
  {
    src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80',
    alt: 'Waterfall cascading through lush green forest',
    category: 'Nature',
    title: 'Hidden Falls',
    aspect: 'square',
  },
  {
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    alt: 'Lake surrounded by mountains with mirror-like reflection',
    category: 'Landscape',
    title: 'Mirror Lake',
    aspect: 'wide',
  },
  {
    src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80',
    alt: 'Ocean waves crashing on rocky shore at sunset',
    category: 'Seascape',
    title: 'Coastal Drama',
    aspect: 'tall',
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
    alt: 'Foggy forest with sunlight streaming through tall trees',
    category: 'Nature',
    title: 'Forest Whispers',
    aspect: 'square',
  },
  {
    src: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80',
    alt: 'Bird flying against a colorful sunset sky',
    category: 'Wildlife',
    title: 'Freedom Flight',
    aspect: 'wide',
  },
  {
    src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
    alt: 'Snow capped mountains reflected in still lake at dawn',
    category: 'Landscape',
    title: 'Alpine Dawn',
    aspect: 'tall',
  },
  {
    src: 'https://images.unsplash.com/photo-1516822003754-cca485356ecb?w=800&q=80',
    alt: 'Abstract architectural details in black and white',
    category: 'Architecture',
    title: 'Concrete Poetry',
    aspect: 'square',
  },
];

// ─── Navbar ──────────────────────────────────────────────────────────────────

// ─── Header Navigation with Limelight Dock ──────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const navItems: NavItem[] = [
    {
      id: 'gallery',
      icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: 'Gallery',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'portfolio',
      icon: <Grid className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: 'Portfolio',
      onClick: () => {
        document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'about',
      icon: <Info className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: 'About',
      onClick: () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'contact',
      icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: 'Contact',
      onClick: () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'studio',
      icon: <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />,
      label: 'Studio',
      onClick: () => {
        window.location.href = '/admin';
      },
    },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      const scrollPos = window.scrollY + window.innerHeight / 3;
      const portfolioEl = document.getElementById('portfolio');
      const aboutEl = document.getElementById('about');
      const contactEl = document.getElementById('contact');

      if (contactEl && scrollPos >= contactEl.offsetTop) {
        setActiveTab(3);
      } else if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        setActiveTab(2);
      } else if (portfolioEl && scrollPos >= portfolioEl.offsetTop) {
        setActiveTab(1);
      } else {
        setActiveTab(0);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-black/85 backdrop-blur-2xl border-b border-white/10 py-2'
          : 'bg-transparent py-3 sm:py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <img
            src="/logo.png"
            alt="hrishav.frames logo"
            className="h-8 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </a>

        {/* Center: Limelight Nav */}
        <div className="flex items-center justify-center">
          <LimelightNav
            items={navItems}
            defaultActiveIndex={activeTab}
            className="h-10 sm:h-12 bg-zinc-950/80 backdrop-blur-2xl border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)] px-0.5 sm:px-1.5 rounded-2xl"
            limelightClassName="bg-amber-400 [--primary:rgb(251,191,36)]"
            iconContainerClassName="p-1.5 sm:p-3"
          />
        </div>

        {/* Right: Quick actions — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="https://instagram.com/hrishav.frames"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-xs text-white/80 hover:text-white transition-all duration-300 font-distancia tracking-wider uppercase"
          >
            <Aperture className="w-3.5 h-3.5 text-amber-300" />
            <span>Follow</span>
          </a>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 hover:bg-amber-400/20 text-xs text-amber-200 hover:text-white transition-all duration-300 font-distancia tracking-wider uppercase"
            title="Studio Photo Manager"
          >
            <Sliders className="w-3 h-3 text-amber-300" />
            <span>Studio</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}



// ─── 3D Photography Infinite Gallery Section ──────────────────────────────────

function GallerySection({ items }: { items: WorksWheelItem[] }) {
  const galleryImages = useMemo(() => {
    return items.map((item) => ({
      src: item.image,
      alt: item.title,
    }));
  }, [items]);

  return (
    <section id="gallery" className="relative bg-black h-screen w-full overflow-hidden">
      <InfiniteGallery
        images={galleryImages}
        speed={1.2}
        zSpacing={3}
        visibleCount={12}
        falloff={{ near: 0.8, far: 14 }}
        className="h-full w-full"
      >
        {/* Brand title overlay with Abril Fatface and difference blend contrast effect */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-center px-4 mix-blend-difference select-none z-10">
          <h1 className="font-abril italic text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tight leading-none mix-blend-difference">
            hrishav.frames
          </h1>
        </div>

        {/* Navigation instruction hint */}
        <div className="text-center absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none select-none z-10 w-[90vw] sm:w-auto">
          <div className="px-4 sm:px-5 py-2 rounded-full bg-zinc-950/80 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col items-center gap-0.5">
            <p className="font-distancia text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-amber-200/90 font-medium">
              <span className="sm:hidden">Swipe left / right to explore</span>
              <span className="hidden sm:inline">Hover photo to wave · Scroll or Drag to explore</span>
            </p>
            <p className="font-distancia text-[8px] sm:text-[8.5px] uppercase tracking-[0.14em] text-white/40 font-light">
              Auto-play resumes after 3 seconds of inactivity
            </p>
          </div>
        </div>
      </InfiniteGallery>
    </section>
  );
}

// ─── Portfolio Grid ──────────────────────────────────────────────────────────

function PortfolioSection({ items }: { items: PortfolioImage[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'glass'>('grid');
  const [filter, setFilter] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const categories = ['All', ...new Set(items.map((img) => img.category))];

  const filtered = filter === 'All' ? items : items.filter((img) => img.category === filter);

  const glassItems = useMemo(() => {
    return filtered.map((img) => ({
      title: img.title,
      src: img.src,
      aspect: img.aspect === 'tall' ? 3 / 4 : img.aspect === 'wide' ? 4 / 3 : 1,
    }));
  }, [filtered]);

  return (
    <section id="portfolio" className="py-16 sm:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading & View Toggle */}
        <div className="text-center mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-[0.4em] text-white/30 mb-3 block font-distancia">
            Selected Works
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">Portfolio</h2>
          <p className="text-xs text-white/40 mt-2 font-distancia uppercase tracking-wider px-4">
            {viewMode === 'grid'
              ? 'Tap any photo to view enlarged'
              : 'Swipe or drag · Tap photo to zoom'}
          </p>

          {/* View Mode Toggle Switch */}
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900/90 border border-white/10 mt-5 sm:mt-6 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setViewMode('grid')}
              type="button"
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-medium font-distancia tracking-wider uppercase transition-all duration-300 cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Grid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('glass')}
              type="button"
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs font-medium font-distancia tracking-wider uppercase transition-all duration-300 cursor-pointer',
                viewMode === 'glass'
                  ? 'bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 text-black font-semibold shadow-[0_0_25px_rgba(251,191,36,0.3)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span>Liquid Glass</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              type="button"
              className={cn(
                'px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs transition-all duration-300 border font-distancia tracking-wider uppercase cursor-pointer',
                filter === cat
                  ? 'bg-white text-black border-white font-medium shadow-md'
                  : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white/80'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Content: Original Masonry Grid vs Liquid Glass Structure */}
        {viewMode === 'grid' ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((img, i) => (
              <div
                key={`${img.src}-${i}`}
                onClick={() => setLightboxIndex(i)}
                className="relative break-inside-avoid group overflow-hidden rounded-xl cursor-pointer"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  draggable={false}
                  className={cn(
                    'w-full object-cover transition-transform duration-700 group-hover:scale-110 select-none',
                    img.aspect === 'tall' && 'h-[400px] sm:h-[500px]',
                    img.aspect === 'wide' && 'h-[220px] sm:h-[300px]',
                    img.aspect === 'square' && 'h-[280px] sm:h-[380px]'
                  )}
                />
                {/* Overlay: always visible on mobile, hover-revealed on desktop */}
                <div className="absolute inset-0 bg-black/40 sm:bg-black/0 sm:group-hover:bg-black/50 transition-all duration-500 flex flex-col justify-between p-4 sm:p-6">
                  <div className="flex justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                    </div>
                  </div>
                  <div className="sm:translate-y-4 sm:group-hover:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300/80 font-distancia">
                      {img.category}
                    </span>
                    <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 sm:mt-1">{img.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Liquid Glass Interactive Container — responsive height */}
            <div className="relative w-full h-[420px] sm:h-[520px] md:h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-zinc-950">
              <LiquidGlassCarousel
                items={glassItems}
                background="#09090b"
                panelHeight={320}
                gap={12}
                entry={true}
                onZoom={(index) => setLightboxIndex(index)}
                className="h-full w-full"
              />
            </div>

            {/* Interactive hint */}
            <div className="flex justify-center mt-1 sm:mt-2">
              <div className="px-3 sm:px-4 py-1.5 rounded-full bg-zinc-900/60 border border-white/10 text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-200/80 font-distancia flex items-center gap-1.5 sm:gap-2 text-center max-w-[90vw]">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 animate-pulse shrink-0" />
                <span>
                  <span className="sm:hidden">Swipe to browse · Tap to zoom</span>
                  <span className="hidden sm:inline">Drag to slide · Click photo to zoom for full-screen view</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal (for both Original Grid & Liquid Glass) */}
      <ImageLightbox
        images={filtered}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIndex) => setLightboxIndex(newIndex)}
      />
    </section>
  );
}

// ─── About Section ───────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-24 bg-black border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80"
                alt="Photographer with camera"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden border-4 border-black shadow-2xl hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&q=80"
                alt="Camera in hand close up"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="mt-2 md:mt-0">
            <span className="text-xs uppercase tracking-[0.4em] text-white/30 mb-3 block font-distancia">About Me</span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-5 sm:mb-6 font-cinzel">
              The Story Behind<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-rose-400">
                the Lens
              </span>
            </h2>
            <div className="space-y-4 text-white/65 leading-relaxed font-light text-sm sm:text-lg">
              <p>
                At eighteen, I&apos;m a photography enthusiast driven by passion rather than profession. My journey began in 2017, when my father gifted me a <strong className="text-white font-medium">Nikon D3400</strong>.
              </p>
              <p>
                Through patience and practice, I transformed curiosity into a distinct visual perspective. Currently a member of the{' '}
                <a
                  href="https://www.instagram.com/jaypee.photo.enthusiasts.guild/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-200 font-medium hover:text-amber-300 underline decoration-amber-400/40 hover:decoration-amber-300 transition-all duration-200"
                  title="Jaypee Photographic Enthusiasts Guild on Instagram"
                >
                  Jaypee Photographic Enthusiasts Guild
                </a>{' '}
                at <strong className="text-white font-medium">JIIT Noida</strong>, I continue to refine my craft with every single frame.
              </p>
            </div>

            {/* Badges / Highlights */}
            <div className="flex flex-wrap gap-2 mt-6 sm:mt-8">
              {[
                { label: 'Nikon D3400' },
                { label: 'JPEG · JIIT Noida', href: 'https://www.instagram.com/jaypee.photo.enthusiasts.guild/' },
                { label: '18 y/o' },
                { label: 'Passion Over Profession' },
                { label: 'Since 2017' },
                { label: 'Visual Perspective' },
              ].map((badge) =>
                badge.href ? (
                  <a
                    key={badge.label}
                    href={badge.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1 rounded-full text-xs border border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 hover:border-amber-400/50 transition-all duration-200 font-distancia tracking-wider"
                  >
                    {badge.label}
                  </a>
                ) : (
                  <span
                    key={badge.label}
                    className="px-3.5 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-amber-200/80 font-distancia tracking-wider"
                  >
                    {badge.label}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ─────────────────────────────────────────────────────────

function ContactSection() {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-black border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-white/30 mb-3 block font-distancia">Get In Touch</span>
        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-8 sm:mb-10 font-cinzel">
          Let&apos;s Create Together
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto">
          <a
            href="mailto:hrishavframes@gmail.com"
            className="flex items-center justify-center gap-3 sm:gap-3.5 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300 group"
          >
            <Mail className="w-5 h-5 text-amber-300/70 group-hover:text-amber-300 transition-colors shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-distancia">Email</span>
              <span className="text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors font-medium">hrishavframes@gmail.com</span>
            </div>
          </a>
          <a
            href="https://instagram.com/hrishav.frames"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 sm:gap-3.5 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300 group"
          >
            <Aperture className="w-5 h-5 text-amber-300/70 group-hover:text-amber-300 transition-colors shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-distancia">Instagram</span>
              <span className="text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors font-medium">@hrishav.frames</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-6 sm:py-8 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <img
            src="/logo.png"
            alt="hrishav.frames"
            className="h-8 sm:h-12 w-auto object-contain opacity-90"
          />
          <span className="text-xs sm:text-sm text-white/30">
            © {new Date().getFullYear()} hrishav.frames — All rights reserved.
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <Link
            href="/admin"
            className="text-xs text-white/40 hover:text-amber-300 transition-colors"
          >
            Studio Login
          </Link>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
        >
          Back to top
          <ArrowUp className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [works, setWorks] = useState<WorksWheelItem[]>(initialPhotos.worksData as WorksWheelItem[]);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>(initialPhotos.portfolioImages as PortfolioImage[]);

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.worksData)) {
          setWorks(data.worksData);
        }
        if (data && Array.isArray(data.portfolioImages)) {
          setPortfolio(data.portfolioImages);
        }
      })
      .catch((err) => console.error('Error syncing photos:', err));
  }, []);

  return (
    <main className="bg-black min-h-screen">
      <Navbar />
      <GallerySection items={works} />
      <PortfolioSection items={portfolio} />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
