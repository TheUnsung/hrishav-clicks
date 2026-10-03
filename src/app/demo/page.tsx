'use client';

import React from 'react';
import Link from 'next/link';
import { LimelightNav, NavItem } from '@/components/ui/limelight-nav';
import {
  Camera,
  Home,
  Compass,
  Sparkles,
  Grid,
  Info,
  Mail,
  Sliders,
  ArrowLeft,
} from 'lucide-react';

import VariableFontCursorProximityDual from '@/components/ui/m-variable-font-cursor-proximity-2';

export default function DemoPage() {
  const portfolioNavItems: NavItem[] = [
    {
      id: 'home',
      icon: <Home />,
      label: 'Home',
      onClick: () => {
        window.location.href = '/#';
      },
    },
    {
      id: 'wheel',
      icon: <Sparkles />,
      label: '3D Wheel',
      onClick: () => {
        window.location.href = '/#gallery';
      },
    },
    {
      id: 'portfolio',
      icon: <Grid />,
      label: 'Portfolio',
      onClick: () => {
        window.location.href = '/#portfolio';
      },
    },
    {
      id: 'about',
      icon: <Info />,
      label: 'About',
      onClick: () => {
        window.location.href = '/#about';
      },
    },
    {
      id: 'contact',
      icon: <Mail />,
      label: 'Contact',
      onClick: () => {
        window.location.href = '/#contact';
      },
    },
    {
      id: 'studio',
      icon: <Sliders />,
      label: 'Studio',
      onClick: () => {
        window.location.href = '/admin';
      },
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.1),_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            LimelightNav Component Showcase
          </h1>
          <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
            An adaptive-width navigation bar with an interactive spotlight limelight beam that glides over the active tab.
          </p>
        </div>

        {/* Variant 1: Portfolio Navigation Bar */}
        <div className="p-8 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold">
              Live Interactive Nav
            </span>
            <h2 className="text-lg font-semibold text-white">
              hrishav.frames Navigation Dock
            </h2>
            <p className="text-xs text-white/40">
              Click any item to watch the smooth limelight spotlight glide.
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <LimelightNav
              items={portfolioNavItems}
              defaultActiveIndex={0}
              className="bg-zinc-950/80 border-white/10 shadow-2xl"
              limelightClassName="bg-amber-400 [--primary:rgb(251,191,36)]"
            />
          </div>
        </div>

        {/* Variant 2: Default Minimal */}
        <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl space-y-4">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
              Default Component
            </span>
            <h2 className="text-base font-semibold text-white">
              Minimal 3-Item Default
            </h2>
          </div>

          <div className="flex justify-center pt-2">
            <LimelightNav className="bg-zinc-950/60 border-white/10" />
          </div>
        </div>

        {/* Variant 3: Variable Font Cursor Proximity */}
        <div className="p-8 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl space-y-6">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold">
              Variable Font Typography
            </span>
            <h2 className="text-lg font-semibold text-white">
              Variable Font Cursor Proximity Dual
            </h2>
            <p className="text-xs text-white/40">
              Interactive font-weight and axis modulation based on cursor distance.
            </p>
          </div>

          <div className="py-12 px-4 rounded-xl bg-black/60 border border-white/5">
            <VariableFontCursorProximityDual />
          </div>
        </div>
      </div>
    </div>
  );
}
