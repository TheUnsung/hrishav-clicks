"use client";

import React, { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("WebGLErrorBoundary caught WebGL rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <WebGLFallback message="WebGL encountered an error while rendering this 3D scene." />
        )
      );
    }
    return this.props.children;
  }
}

export function WebGLFallback({
  className,
  message = "This carousel needs WebGL, which is unavailable in this browser.",
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-zinc-950/80 border border-white/10 rounded-2xl text-white/70",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-amber-300">
        <AlertCircle className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-white/90 max-w-sm mb-2">{message}</p>
      <p className="text-xs text-white/40">
        Try enabling hardware acceleration in your browser settings.
      </p>
    </div>
  );
}
