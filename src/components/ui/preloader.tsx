'use client';

import React, { useEffect, useState, useRef } from 'react';

export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPulse, setIsPulse] = useState(false);

  const targetProgressRef = useRef(15);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. Disable page scrolling while loader is visible
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

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
          // Fade loader out over 0.5s
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
            document.body.style.overflow = originalOverflow || '';
          }, 500);
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
        className={`relative flex items-center justify-center transition-transform duration-300 ${
          isPulse ? 'final-pulse-anim' : ''
        }`}
        style={{
          width: 'clamp(120px, 25vw, 300px)',
          maxWidth: '300px',
        }}
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

      <span className="sr-only">Loading website progress: {Math.round(progress)}%</span>
    </div>
  );
}
