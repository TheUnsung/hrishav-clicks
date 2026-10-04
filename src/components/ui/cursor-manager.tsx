'use client';

import React, { useEffect, useState } from 'react';
import { ApertureCursor } from './aperture-cursor';
import { NyanCursor } from './nyan-cursor';
import { Camera, Sparkles, MousePointer, ChevronUp } from 'lucide-react';

export type CursorType = 'aperture' | 'nyan' | 'default';

export function CursorManager() {
  const [cursor, setCursor] = useState<CursorType>('aperture');
  const [isDesktop, setIsDesktop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check if real desktop mouse device
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setIsDesktop(hasMouse);
    if (!hasMouse) return;

    // Load saved preference or default to 'aperture'
    const saved = localStorage.getItem('preferred-cursor') as CursorType | null;
    if (saved && ['aperture', 'nyan', 'default'].includes(saved)) {
      setCursor(saved);
    }

    // Listen for cursor changes dispatched from preloader or other components
    const handleCursorChange = (e: Event) => {
      const customEvent = e as CustomEvent<CursorType>;
      if (customEvent.detail) {
        setCursor(customEvent.detail);
        localStorage.setItem('preferred-cursor', customEvent.detail);
      }
    };

    window.addEventListener('cursor-change', handleCursorChange);
    return () => window.removeEventListener('cursor-change', handleCursorChange);
  }, []);

  // Update HTML class for proper cursor hiding styles
  useEffect(() => {
    if (!isDesktop) return;

    const root = document.documentElement;
    root.classList.remove('cursor-aperture', 'cursor-nyan', 'cursor-default');
    root.classList.add(`cursor-${cursor}`);
  }, [cursor, isDesktop]);

  // Do not mount anything on mobile
  if (!isDesktop) return null;

  const selectCursor = (type: CursorType) => {
    setCursor(type);
    localStorage.setItem('preferred-cursor', type);
    window.dispatchEvent(new CustomEvent('cursor-change', { detail: type }));
    setMenuOpen(false);
  };

  return (
    <>
      {cursor === 'aperture' && <ApertureCursor />}
      {cursor === 'nyan' && <NyanCursor />}

      {/* Floating Cursor Switcher Pill for Desktop */}
      <div className="fixed bottom-6 right-6 z-[9990] select-none font-sans">
        <div className="relative">
          {/* Expanded Menu */}
          {menuOpen && (
            <div
              className="absolute bottom-12 right-0 mb-2 p-1.5 rounded-2xl bg-zinc-950/90 border border-white/15 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col gap-1 min-w-[170px] animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-distancia text-white/40 border-b border-white/10">
                Choose Cursor
              </div>
              <button
                type="button"
                onClick={() => selectCursor('aperture')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 text-left ${
                  cursor === 'aperture'
                    ? 'bg-amber-400/20 text-amber-200 font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <div className="flex flex-col">
                  <span className="font-medium">Aperture Iris</span>
                  <span className="text-[9px] text-white/40">Shutter & RAW Burst</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectCursor('nyan')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 text-left ${
                  cursor === 'nyan'
                    ? 'bg-purple-500/20 text-purple-200 font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <div className="flex flex-col">
                  <span className="font-medium">Nyan Cat</span>
                  <span className="text-[9px] text-white/40">Rainbow Trail</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectCursor('default')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 text-left ${
                  cursor === 'default'
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5 text-zinc-300" />
                <div className="flex flex-col">
                  <span className="font-medium">Classic</span>
                  <span className="text-[9px] text-white/40">Default OS Pointer</span>
                </div>
              </button>
            </div>
          )}

          {/* Collapsed Pill Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Change Cursor"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/15 backdrop-blur-xl shadow-lg hover:shadow-amber-500/10 text-white/80 hover:text-white transition-all duration-300 group"
          >
            {cursor === 'aperture' && <Camera className="w-3.5 h-3.5 text-amber-300" />}
            {cursor === 'nyan' && <Sparkles className="w-3.5 h-3.5 text-purple-300" />}
            {cursor === 'default' && <MousePointer className="w-3.5 h-3.5 text-zinc-300" />}

            <span className="text-[11px] font-distancia uppercase tracking-wider capitalize">
              {cursor}
            </span>
            <ChevronUp
              className={`w-3 h-3 text-white/40 transition-transform duration-200 ${
                menuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );
}
