"use client";
import { useRef } from "react";
import { VariableFontCursorProximity } from "@/components/ui/variable-font-cursor-proximity";

export default function VariableFontCursorProximityDual() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex min-h-50 flex-col items-center justify-center gap-2 px-6 text-center select-none"
      ref={containerRef}
    >
      <VariableFontCursorProximity
        className="text-4xl sm:text-6xl md:text-7xl leading-tight font-cinzel text-white tracking-wider"
        containerRef={containerRef}
        falloff="gaussian"
        fromFontVariationSettings="'wght' 400"
        radius={140}
        toFontVariationSettings="'wght' 900"
      >
        hrishav.frames
      </VariableFontCursorProximity>
      <VariableFontCursorProximity
        className="text-2xl sm:text-4xl md:text-5xl text-white/50 leading-tight font-cinzel uppercase tracking-[0.25em]"
        containerRef={containerRef}
        falloff="gaussian"
        fromFontVariationSettings="'wght' 900"
        radius={140}
        toFontVariationSettings="'wght' 400"
      >
        portfolio
      </VariableFontCursorProximity>
    </div>
  );
}
