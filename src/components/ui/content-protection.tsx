'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export function ContentProtection() {
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const triggerWarning = (msg: string) => {
      setWarning(msg);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setWarning(null);
      }, 3000);
    };

    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning('Protected Content: Right-click and image downloading are disabled.');
    };

    // 2. Prevent Developer Tools & Source Code Inspection Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Developer inspection tools are disabled.');
        return false;
      }

      // Ctrl+Shift+I / J / C (DevTools)
      if (isCmdOrCtrl && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Developer inspection tools are disabled.');
        return false;
      }

      // Ctrl+U (View Source)
      if (isCmdOrCtrl && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('View page source is disabled.');
        return false;
      }

      // Ctrl+S (Save Page)
      if (isCmdOrCtrl && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Saving page assets is disabled.');
        return false;
      }

      // Ctrl+P (Print Page)
      if (isCmdOrCtrl && key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Page printing is disabled.');
        return false;
      }
    };

    // 3. Prevent dragging images to desktop or new tab
    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      clearTimeout(timeout);
    };
  }, []);

  if (!warning) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900/95 border border-amber-400/40 text-amber-200 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none select-none">
      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="font-medium tracking-wide">{warning}</span>
    </div>
  );
}
