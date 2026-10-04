'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Camera, Sparkles, MousePointer, ArrowRight } from 'lucide-react';

export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPulse, setIsPulse] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showCursorOptions, setShowCursorOptions] = useState(false);
  const [selectedCursor, setSelectedCursor] = useState<'aperture' | 'nyan' | 'default'>('aperture');

  const targetProgressRef = useRef(15);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const originalOverflowRef = useRef('');

  useEffect(() => {
    // 1. Disable page scrolling while loader is visible
    const originalOverflow = document.body.style.overflow;
    originalOverflowRef.current = originalOverflow;
    document.body.style.overflow = 'hidden';

    // Detect if desktop with mouse
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsDesktop(hasMouse);

    const saved = localStorage.getItem('preferred-cursor') as 'aperture' | 'nyan' | 'default' | null;
    if (saved && ['aperture', 'nyan', 'default'].includes(saved)) {
      setSelectedCursor(saved);
    }

    // Play the audio from the video (browsers allow unmuted audio if allowed or on first gesture)
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(() => {
        // If autoplay is blocked by browser policy without user gesture, listen for any first interaction
        const playOnInteraction = () => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          window.removeEventListener('pointerdown', playOnInteraction);
          window.removeEventListener('keydown', playOnInteraction);
        };
        window.addEventListener('pointerdown', playOnInteraction, { once: true });
        window.addEventListener('keydown', playOnInteraction, { once: true });
      });
    }

    // 2. Track real page loading stages
    let hasWindowLoaded = document.readyState === 'complete';
    let hasGalleryLoaded = false;
    let isFullyDone = false;

    // Track fonts readiness
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        targetProgressRef.current = Math.max(targetProgressRef.current, 40);
      });
    }

    // Interactive ready state
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      targetProgressRef.current = Math.max(targetProgressRef.current, 55);
    }

    const onWindowLoad = () => {
      hasWindowLoaded = true;
      targetProgressRef.current = Math.max(targetProgressRef.current, 85);
      checkReady();
    };

    const onGalleryReady = () => {
      hasGalleryLoaded = true;
      targetProgressRef.current = Math.max(targetProgressRef.current, 90);
      checkReady();
    };

    const checkReady = () => {
      if (hasWindowLoaded && hasGalleryLoaded) {
        targetProgressRef.current = 100;
      }
    };

    if (hasWindowLoaded) {
      targetProgressRef.current = Math.max(targetProgressRef.current, 85);
      checkReady();
    } else {
      window.addEventListener('load', onWindowLoad);
    }

    window.addEventListener('gallery-ready', onGalleryReady);

    // Fallback timer: ensure progress reliably finishes even on slow networks
    const fallbackTimer = setTimeout(() => {
      targetProgressRef.current = 100;
    }, 4500);

    // 3. Smooth requestAnimationFrame progress interpolation
    const updateProgress = () => {
      const current = currentProgressRef.current;
      const target = targetProgressRef.current;

      if (current < target) {
        // Fast yet buttery-smooth approach
        const step = Math.max((target - current) * 0.08, 0.4);
        const nextVal = Math.min(current + step, target);
        currentProgressRef.current = nextVal;
        setProgress(nextVal);
      }

      if (currentProgressRef.current >= 99.8 && !isFullyDone) {
        isFullyDone = true;
        currentProgressRef.current = 100;
        setProgress(100);

        // Final gentle burst pulse at 100% as seen in reference video
        setIsPulse(true);

        setTimeout(() => {
          if (hasMouse) {
            // For desktop devices: reveal cursor selection screen before entering
            setShowCursorOptions(true);
          } else {
            // For mobile devices: enter immediately without cursor options
            dismissLoader();
          }
        }, 550);

        return;
      }

      animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener('load', onWindowLoad);
      window.removeEventListener('gallery-ready', onGalleryReady);
      clearTimeout(fallbackTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  const dismissLoader = () => {
    setIsFadingOut(true);

    // Fade out audio gracefully
    if (audioRef.current) {
      const fadeAudio = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.1) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.2);
        } else {
          clearInterval(fadeAudio);
          if (audioRef.current) audioRef.current.pause();
        }
      }, 80);
    }

    setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = originalOverflowRef.current || '';
    }, 500);
  };

  const handleSelectCursor = (type: 'aperture' | 'nyan' | 'default') => {
    setSelectedCursor(type);
    localStorage.setItem('preferred-cursor', type);
    window.dispatchEvent(new CustomEvent('cursor-change', { detail: type }));
  };

  const handleEnterSite = () => {
    handleSelectCursor(selectedCursor);
    dismissLoader();
  };

  if (!mounted) return null;

  // Percentage from right edge (100% down to 0%)
  const clipInsetRight = Math.max(0, 100 - progress);

  return (
    <div
      id="brand-preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading hrishav.frames"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
      }}
    >
      {/* Audio element sourced from the reference video */}
      <audio
        ref={audioRef}
        src="/gemini_generated_video_ce79edf3.mp4"
        preload="auto"
        playsInline
      />
      {/* Decorative ambient subtle star sparkle in bottom right like reference video */}
      <div className="absolute bottom-8 right-8 text-white/30 text-lg select-none pointer-events-none">
        ✦
      </div>

      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-500 ${
          isPulse ? 'final-pulse-anim' : ''
        }`}
        style={{
          width: showCursorOptions ? 'clamp(300px, 90vw, 680px)' : 'clamp(120px, 25vw, 300px)',
          maxWidth: showCursorOptions ? '680px' : '300px',
        }}
      >
        {/* Top: Logo Animation */}
        <div
          className={`relative transition-all duration-500 ${
            showCursorOptions ? 'w-24 sm:w-28 mb-5 sm:mb-6' : 'w-full'
          }`}
        >
          {/* Layer 1: Base dimmed, grayscale background logo (opacity ~0.25) */}
          <img
            src="/logo.png"
            alt="hrishav.frames"
            className="w-full h-auto object-contain block opacity-25 filter grayscale select-none pointer-events-none"
            draggable={false}
          />

          {/* Layer 2: Glowing full-white filled logo revealed via horizontal clip-path */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none select-none"
            style={{
              clipPath: `inset(0 ${clipInsetRight}% 0 0)`,
              WebkitClipPath: `inset(0 ${clipInsetRight}% 0 0)`,
            }}
          >
            <img
              src="/logo.png"
              alt="hrishav.frames"
              className="w-full h-auto object-contain block select-none pointer-events-none"
              style={{
                filter:
                  'drop-shadow(0 0 10px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 25px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 50px rgba(255, 255, 255, 0.3))',
              }}
              draggable={false}
            />
          </div>

          {/* Layer 3: Thin bright vertical glowing light bar following the exact fill line */}
          {progress > 0 && progress < 100 && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: `${progress}%`,
                transform: 'translateX(-50%)',
                width: '4px',
                background: 'linear-gradient(to bottom, transparent, #ffffff 25%, #ffffff 75%, transparent)',
                boxShadow:
                  '0 0 12px 3px #ffffff, 0 0 24px 6px rgba(255, 255, 255, 0.8), 0 0 45px 10px rgba(255, 255, 255, 0.4)',
                borderRadius: '9999px',
                zIndex: 10,
              }}
            />
          )}
        </div>

        {/* Cursor Selection Panel (Desktop Only before entering the site) */}
        {showCursorOptions && (
          <div className="w-full text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <span className="text-[10px] sm:text-xs tracking-[0.3em] font-distancia text-amber-300 uppercase">
              Interactive Experience
            </span>
            <h3 className="text-xl sm:text-2xl font-cinzel text-white mt-1">
              Select Your Cursor
            </h3>
            <p className="text-[10px] sm:text-xs text-white/50 font-distancia uppercase tracking-wider mt-1 mb-5 sm:mb-6">
              Choose your interactive pointer before entering the portfolio
            </p>

            {/* 3 Cursor Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-6">
              {/* Option 1: Aperture Cursor */}
              <button
                type="button"
                onClick={() => handleSelectCursor('aperture')}
                className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selectedCursor === 'aperture'
                    ? 'bg-amber-400/15 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/50 scale-[1.02]'
                    : 'bg-zinc-900/60 border-white/10 hover:border-white/25 hover:bg-zinc-900/90'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-3">
                  <Camera className="w-5 h-5 text-amber-300" />
                </div>
                <span className="font-cinzel text-sm sm:text-base text-white font-medium">
                  Aperture Iris
                </span>
                <span className="text-[9.5px] text-white/50 font-distancia uppercase tracking-wider mt-1.5 leading-relaxed">
                  Camera Lens · Shutter Flash & RAW Badges Burst
                </span>
                {selectedCursor === 'aperture' && (
                  <span className="mt-2.5 text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-distancia uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </button>

              {/* Option 2: Nyan Cat Cursor */}
              <button
                type="button"
                onClick={() => handleSelectCursor('nyan')}
                className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selectedCursor === 'nyan'
                    ? 'bg-purple-500/15 border-purple-400/80 shadow-[0_0_25px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/50 scale-[1.02]'
                    : 'bg-zinc-900/60 border-white/10 hover:border-white/25 hover:bg-zinc-900/90'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-400/30 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                </div>
                <span className="font-cinzel text-sm sm:text-base text-white font-medium">
                  Nyan Cat
                </span>
                <span className="text-[9.5px] text-white/50 font-distancia uppercase tracking-wider mt-1.5 leading-relaxed">
                  Retro Pop-Tart Cat · 6-Color Rainbow Wave
                </span>
                {selectedCursor === 'nyan' && (
                  <span className="mt-2.5 text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-distancia uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </button>

              {/* Option 3: Aero Black Modern Pointer */}
              <button
                type="button"
                onClick={() => handleSelectCursor('default')}
                className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selectedCursor === 'default'
                    ? 'bg-white/15 border-white shadow-[0_0_25px_rgba(255,255,255,0.2)] ring-1 ring-white/50 scale-[1.02]'
                    : 'bg-zinc-900/60 border-white/10 hover:border-white/25 hover:bg-zinc-900/90'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center mb-3">
                  <img
                    src="/cursors/pointer.png"
                    alt="Aero Black"
                    className="w-5 h-5 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  />
                </div>
                <span className="font-cinzel text-sm sm:text-base text-white font-medium">
                  Aero Black
                </span>
                <span className="text-[9.5px] text-white/50 font-distancia uppercase tracking-wider mt-1.5 leading-relaxed">
                  Classic Modern Dark · Rounded Windows Cursor
                </span>
                {selectedCursor === 'default' && (
                  <span className="mt-2.5 text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 font-distancia uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </button>
            </div>

            {/* Enter Portfolio Button */}
            <button
              type="button"
              onClick={handleEnterSite}
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 hover:from-amber-100 hover:to-amber-300 text-black font-semibold text-xs font-distancia tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Enter Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <span className="sr-only">Loading website progress: {Math.round(progress)}%</span>
    </div>
  );
}
