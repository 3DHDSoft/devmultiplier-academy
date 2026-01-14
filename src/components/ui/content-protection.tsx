'use client';

import { useEffect, useCallback, useState, ReactNode } from 'react';

interface ContentProtectionProps {
  children: ReactNode;
  userEmail?: string;
  enabled?: boolean;
}

/**
 * ContentProtection component provides basic DRM-like protection for course content.
 *
 * Features:
 * - Disables right-click context menu
 * - Blocks common copy/save keyboard shortcuts
 * - Detects DevTools opening (basic detection)
 * - Renders invisible watermark with user identification
 *
 * Note: These protections deter casual copying but can be bypassed by determined users.
 * The primary goal is to make unauthorized sharing traceable through watermarks.
 */
export function ContentProtection({
  children,
  userEmail,
  enabled = true,
}: ContentProtectionProps) {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  // Block right-click context menu
  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      if (!enabled) return;
      e.preventDefault();
      return false;
    },
    [enabled]
  );

  // Block keyboard shortcuts for copying/saving
  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (!enabled) return;

      const blockedCombinations = [
        // Ctrl/Cmd + C (Copy)
        { ctrl: true, key: 'c' },
        // Ctrl/Cmd + S (Save)
        { ctrl: true, key: 's' },
        // Ctrl/Cmd + U (View Source)
        { ctrl: true, key: 'u' },
        // Ctrl/Cmd + P (Print)
        { ctrl: true, key: 'p' },
        // Ctrl/Cmd + Shift + I (DevTools)
        { ctrl: true, shift: true, key: 'i' },
        // Ctrl/Cmd + Shift + J (DevTools Console)
        { ctrl: true, shift: true, key: 'j' },
        // Ctrl/Cmd + Shift + C (DevTools Inspect)
        { ctrl: true, shift: true, key: 'c' },
        // F12 (DevTools)
        { key: 'F12' },
      ];

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      for (const combo of blockedCombinations) {
        const ctrlMatch = combo.ctrl ? isCtrlOrCmd : !isCtrlOrCmd;
        const shiftMatch = combo.shift ? e.shiftKey : !combo.shift || !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase();

        if (ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    },
    [enabled]
  );

  // Basic DevTools detection
  useEffect(() => {
    if (!enabled) return;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    // Check on resize (DevTools opening changes window dimensions)
    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    return () => {
      window.removeEventListener('resize', checkDevTools);
    };
  }, [enabled]);

  // Attach event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleContextMenu, handleKeyDown]);

  // Disable drag events on the document
  useEffect(() => {
    if (!enabled) return;

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className={isDevToolsOpen ? 'content-blurred' : ''}>
      {/* Protected content wrapper */}
      <div className="protected-content">{children}</div>

      {/* Invisible watermark overlay */}
      {userEmail && <WatermarkOverlay userEmail={userEmail} />}

      {/* Print blocked message (shown only when printing) */}
      <div className="print-blocked-message p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Content Protected</h2>
        <p>This content is protected and cannot be printed.</p>
        <p className="text-sm text-gray-500 mt-2">
          Licensed to: {userEmail}
        </p>
      </div>

      {/* DevTools warning overlay */}
      {isDevToolsOpen && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-[#161b22] p-8 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-semibold text-[#1f2328] dark:text-[#e6edf3] mb-4">
              Developer Tools Detected
            </h2>
            <p className="text-[#656d76] dark:text-[#848d97] mb-4">
              Please close developer tools to continue viewing this content.
            </p>
            <p className="text-sm text-[#656d76] dark:text-[#848d97]">
              This content is licensed to: {userEmail}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Invisible watermark that tiles across the entire viewport
 * Contains user email for traceability if content is screenshot/shared
 */
function WatermarkOverlay({ userEmail }: { userEmail: string }) {
  const [watermarks, setWatermarks] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Generate watermark positions
    const generateWatermarks = () => {
      const marks: Array<{ id: number; x: number; y: number }> = [];
      const spacing = 300; // pixels between watermarks

      const cols = Math.ceil(window.innerWidth / spacing) + 2;
      const rows = Math.ceil(window.innerHeight / spacing) + 2;

      let id = 0;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          marks.push({
            id: id++,
            x: col * spacing + (row % 2 === 0 ? 0 : spacing / 2),
            y: row * spacing,
          });
        }
      }

      setWatermarks(marks);
    };

    generateWatermarks();
    window.addEventListener('resize', generateWatermarks);

    return () => {
      window.removeEventListener('resize', generateWatermarks);
    };
  }, []);

  const timestamp = new Date().toISOString().split('T')[0];
  const watermarkText = `Licensed to ${userEmail} - ${timestamp}`;

  return (
    <div className="watermark-overlay" aria-hidden="true">
      {watermarks.map((mark) => (
        <span
          key={mark.id}
          className="watermark-text"
          style={{
            left: `${mark.x}px`,
            top: `${mark.y}px`,
          }}
        >
          {watermarkText}
        </span>
      ))}
    </div>
  );
}

export default ContentProtection;
