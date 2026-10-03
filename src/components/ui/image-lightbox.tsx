'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LightboxItem {
  src: string;
  alt?: string;
  title: string;
  category?: string;
}

interface ImageLightboxProps {
  images: LightboxItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < images.length;
  const currentImage = isOpen ? images[currentIndex] : null;

  // Touch swipe state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    const prev = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(prev);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    const next = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(next);
  }, [currentIndex, images.length, onNavigate]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only swipe if horizontal movement is dominant and substantial
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [handleNext, handlePrev]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    // Lock body scroll while open
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 select-none"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Action Bar */}
      <div
        className="absolute top-0 left-0 right-0 p-3 sm:p-6 flex items-center justify-between z-20 pointer-events-none"
      >
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {currentImage.category && (
            <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
              {currentImage.category}
            </span>
          )}
          <span className="text-xs text-white/50 tracking-wider">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/40">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Protected View</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition hover:scale-105 active:scale-95"
            aria-label="Close enlarged view"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows — hidden on mobile (use swipe instead) */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden sm:flex absolute left-4 sm:left-8 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 items-center justify-center text-white transition hover:scale-110 active:scale-95 backdrop-blur-md"
            aria-label="Previous image"
            title="Previous (Left arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden sm:flex absolute right-4 sm:right-8 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 items-center justify-center text-white transition hover:scale-110 active:scale-95 backdrop-blur-md"
            aria-label="Next image"
            title="Next (Right arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div
        className="relative max-w-[96vw] sm:max-w-[90vw] max-h-[85vh] sm:max-h-[82vh] flex flex-col items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 bg-zinc-950 flex items-center justify-center">
          <img
            src={currentImage.src}
            alt={currentImage.alt || currentImage.title}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-[94vw] sm:max-w-[88vw] max-h-[72vh] sm:max-h-[76vh] object-contain pointer-events-none select-none animate-in zoom-in-95 duration-200"
          />

          {/* Invisible security overlay over image to block element inspection & right-clicking */}
          <div
            className="absolute inset-0 bg-transparent select-none cursor-default"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* Caption below image */}
        <div className="mt-3 sm:mt-4 text-center">
          <h3 className="text-base sm:text-xl font-bold tracking-tight text-white">
            {currentImage.title}
          </h3>
          {currentImage.alt && currentImage.alt !== currentImage.title && (
            <p className="text-xs text-white/50 mt-1 max-w-[85vw] sm:max-w-md mx-auto">
              {currentImage.alt}
            </p>
          )}
          {/* Mobile swipe hint */}
          {images.length > 1 && (
            <p className="sm:hidden text-[10px] text-white/30 mt-2 tracking-wider font-distancia uppercase">
              ← Swipe to navigate →
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
