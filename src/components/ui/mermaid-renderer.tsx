'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  children: React.ReactNode;
}

export function MermaidRenderer({ children }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [expandedSvg, setExpandedSvg] = useState<string | null>(null);

  const closeExpanded = useCallback(() => {
    setExpandedSvg(null);
    document.body.style.overflow = '';
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedSvg) {
        closeExpanded();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expandedSvg, closeExpanded]);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;

    // Initialize mermaid with theme settings
    const isDark = document.documentElement.classList.contains('dark');

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    });

    // Find all mermaid code blocks - check multiple selectors since rehype-pretty-code
    // transforms the code blocks and adds data-language attribute
    const mermaidBlocks = containerRef.current.querySelectorAll(
      'pre code.language-mermaid, code.language-mermaid, pre[data-language="mermaid"] code, code[data-language="mermaid"]'
    );

    mermaidBlocks.forEach(async (block, index) => {
      const code = block.textContent || '';
      if (!code.trim()) return;

      // Create a container for the rendered diagram
      const container = document.createElement('div');
      container.className = 'mermaid-diagram';

      try {
        const { svg } = await mermaid.render(`mermaid-${index}-${Date.now()}`, code);

        // Create wrapper with expand button
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-wrapper';
        wrapper.innerHTML = `
          <button class="mermaid-expand-btn" aria-label="Expand diagram" title="Expand diagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        `;

        container.innerHTML = svg;
        wrapper.appendChild(container);

        // Add click handler to expand button
        const expandBtn = wrapper.querySelector('.mermaid-expand-btn');
        if (expandBtn) {
          expandBtn.addEventListener('click', () => {
            setExpandedSvg(svg);
            document.body.style.overflow = 'hidden';
          });
        }

        // Replace the pre/code block with the rendered diagram
        // Check for figure (rehype-pretty-code wrapper), then pre
        const figureElement = block.closest('figure[data-rehype-pretty-code-figure]');
        const preElement = block.closest('pre');
        const elementToReplace = figureElement || preElement;

        if (elementToReplace && elementToReplace.parentNode) {
          elementToReplace.parentNode.replaceChild(wrapper, elementToReplace);
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        // Keep the original code block on error
      }
    });

    initializedRef.current = true;
  }, [children]);

  // Re-render on theme change
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Theme changed, re-initialize
          initializedRef.current = false;
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={containerRef}>{children}</div>

      {/* Expanded modal overlay */}
      {expandedSvg && (
        <div
          className="mermaid-modal-overlay"
          onClick={closeExpanded}
        >
          <div
            className="mermaid-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mermaid-close-btn"
              onClick={closeExpanded}
              aria-label="Close expanded view"
            >
              <X size={24} />
            </button>
            <div
              className="mermaid-modal-diagram"
              dangerouslySetInnerHTML={{ __html: expandedSvg }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default MermaidRenderer;
