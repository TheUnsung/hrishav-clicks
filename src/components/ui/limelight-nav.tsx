"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, cloneElement } from 'react';
import { cn } from '@/lib/utils';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// --- Internal Types and Defaults ---

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
);

const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export type NavItem = {
  id: string | number;
  icon: React.ReactElement<{ className?: string }>;
  label?: string;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: 'default-home', icon: <DefaultHomeIcon />, label: 'Home' },
  { id: 'default-explore', icon: <DefaultCompassIcon />, label: 'Explore' },
  { id: 'default-notifications', icon: <DefaultBellIcon />, label: 'Notifications' },
];

export type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
};

/**
 * An adaptive-width navigation bar with a "limelight" effect that highlights the active or hovered item,
 * swiftly shifting on hover and brightening intensely on click.
 */
export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
}: LimelightNavProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  // Sync with external defaultActiveIndex if provided
  useEffect(() => {
    if (defaultActiveIndex !== undefined) {
      setActiveIndex(defaultActiveIndex);
    }
  }, [defaultActiveIndex]);

  // Target index for positioning the spotlight beam (hover takes priority)
  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  useIsomorphicLayoutEffect(() => {
    if (items.length === 0) return;

    const limelight = limelightRef.current;
    const currentTargetEl = navItemRefs.current[targetIndex];
    
    if (limelight && currentTargetEl) {
      const newLeft = currentTargetEl.offsetLeft + currentTargetEl.offsetWidth / 2 - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;

      if (!isReady) {
        const timer = setTimeout(() => setIsReady(true), 30);
        return () => clearTimeout(timer);
      }
    }
  }, [targetIndex, isReady, items]);

  if (items.length === 0) {
    return null; 
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setActiveIndex(index);
    setIsClicked(true);
    onTabChange?.(index);
    itemOnClick?.();

    // Reset intense flash after animation
    setTimeout(() => {
      setIsClicked(false);
    }, 450);
  };

  return (
    <nav
      onMouseLeave={() => setHoveredIndex(null)}
      className={cn(
        "relative inline-flex items-center h-16 rounded-lg bg-card text-foreground border px-2 select-none",
        className
      )}
    >
      {items.map(({ id, icon, label, onClick }, index) => {
        const isCurrentTarget = targetIndex === index;
        const isCurrentActive = activeIndex === index;

        return (
          <a
            key={id}
            ref={(el) => {
              navItemRefs.current[index] = el;
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onClick={() => handleItemClick(index, onClick)}
            className={cn(
              "relative z-20 flex h-full cursor-pointer items-center justify-center p-5 transition-transform duration-200 ease-out",
              isCurrentTarget ? "scale-110" : "scale-100",
              iconContainerClassName
            )}
            aria-label={label}
          >
            {cloneElement(icon, {
              className: cn(
                "w-6 h-6 transition-all duration-200 ease-out",
                isCurrentTarget
                  ? isClicked && isCurrentActive
                    ? "opacity-100 brightness-150 drop-shadow-[0_0_12px_rgba(251,191,36,1)] scale-110"
                    : "opacity-100 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  : "opacity-40 hover:opacity-80",
                icon.props.className,
                iconClassName
              ),
            })}
            {label && (
              <span
                className={cn(
                  "hidden sm:block absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-distancia text-amber-200/90 bg-zinc-950/95 border border-amber-400/25 shadow-[0_4px_16px_rgba(0,0,0,0.8)] pointer-events-none transition-all duration-200 whitespace-nowrap z-30",
                  hoveredIndex === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1 pointer-events-none"
                )}
              >
                {label}
              </span>
            )}
          </a>
        );
      })}

      {/* Limelight Spotlight Beam */}
      <div 
        ref={limelightRef}
        className={cn(
          "absolute top-0 z-10 w-11 h-[5px] rounded-full bg-primary pointer-events-none",
          isReady ? "transition-[left,transform,filter,box-shadow] duration-200 ease-out" : "",
          isClicked
            ? "brightness-200 scale-x-125 shadow-[0_0_35px_12px_var(--primary,rgba(251,191,36,1))]"
            : hoveredIndex !== null
            ? "brightness-125 scale-x-105 shadow-[0_15px_25px_var(--primary,rgba(251,191,36,0.85))]"
            : "shadow-[0_12px_20px_var(--primary,rgba(251,191,36,0.6))]",
          limelightClassName
        )}
        style={{ left: '-999px' }}
      >
        {/* Glowing Spotlight Cone Projection */}
        <div
          className={cn(
            "absolute left-[-35%] top-[5px] w-[170%] [clip-path:polygon(6%_100%,26%_0,74%_0,94%_100%)] pointer-events-none transition-all duration-200 ease-out",
            isClicked
              ? "h-10 sm:h-20 bg-gradient-to-b from-primary/80 via-primary/30 to-transparent brightness-150"
              : hoveredIndex !== null
              ? "h-9 sm:h-16 bg-gradient-to-b from-primary/55 via-primary/20 to-transparent"
              : "h-8 sm:h-14 bg-gradient-to-b from-primary/35 via-primary/10 to-transparent"
          )}
        />
      </div>
    </nav>
  );
};

export default LimelightNav;
