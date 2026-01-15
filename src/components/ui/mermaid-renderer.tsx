'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  children: React.ReactNode;
}

// Debug logging - just uses console.log
function logDebug(msg: string) {
  console.log(`[MermaidRenderer] ${msg}`);
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

  // Function to process mermaid blocks
  const processMermaidBlocks = useCallback(() => {
    if (!containerRef.current || initializedRef.current) return;

    logDebug('Processing mermaid blocks...');

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
    let mermaidBlocks = containerRef.current.querySelectorAll(
      'pre code.language-mermaid, code.language-mermaid, pre[data-language="mermaid"] code, code[data-language="mermaid"]'
    );

    // Debug: log all pre elements
    const allPres = containerRef.current.querySelectorAll('pre');
    logDebug(`Found ${mermaidBlocks.length} mermaid blocks, ${allPres.length} total pre elements`);

    // If standard selectors don't work, try finding pre elements with mermaid content
    if (mermaidBlocks.length === 0 && allPres.length > 0) {
      logDebug('Standard selectors failed, checking pre content...');

      // Look for pre elements that contain mermaid diagram syntax
      const mermaidPres: Element[] = [];
      allPres.forEach((pre, i) => {
        const dataLang = pre.getAttribute('data-language');
        const codeEl = pre.querySelector('code');
        const codeClass = codeEl?.className || '';
        const textContent = pre.textContent || '';

        // Check various indicators of mermaid content
        const isMermaid =
          dataLang === 'mermaid' ||
          codeClass.includes('language-mermaid') ||
          textContent.includes('%%{init:') ||
          (textContent.includes('graph ') && (textContent.includes('-->') || textContent.includes('---'))) ||
          (textContent.includes('flowchart ') && textContent.includes('-->')) ||
          textContent.includes('sequenceDiagram') ||
          textContent.includes('classDiagram') ||
          textContent.includes('stateDiagram') ||
          textContent.includes('erDiagram') ||
          textContent.includes('journey') ||
          textContent.includes('gantt') ||
          textContent.includes('pie title');

        if (i < 5) {
          // Only log first 5 pre elements
          logDebug(`Pre ${i}: lang="${dataLang}", class="${codeClass.substring(0, 30)}", mermaid=${isMermaid}`);
        }
        if (isMermaid && codeEl) {
          mermaidPres.push(codeEl);
        }
      });

      if (mermaidPres.length > 0) {
        logDebug(`Found ${mermaidPres.length} mermaid blocks via content analysis`);
        mermaidBlocks = mermaidPres as unknown as NodeListOf<Element>;
      }
    }

    if (mermaidBlocks.length === 0) {
      const containerHTML = containerRef.current.innerHTML;
      logDebug(`No mermaid found. HTML length: ${containerHTML.length}`);
      if (containerHTML.length < 100) {
        logDebug(`Container empty or minimal: "${containerHTML.substring(0, 100)}"`);
      }
      return; // Don't mark as initialized if nothing found
    }

    // Convert to array to ensure consistent iteration
    const blocksArray = Array.from(mermaidBlocks);
    logDebug(`Processing ${blocksArray.length} mermaid blocks`);

    blocksArray.forEach(async (block, index) => {
      const code = block.textContent || '';
      if (!code.trim()) return;

      // Create a container for the rendered diagram
      const container = document.createElement('div');
      container.className = 'mermaid-diagram';

      try {
        logDebug(`Rendering block ${index}...`);
        const { svg } = await mermaid.render(`mermaid-${index}-${Date.now()}`, code);
        logDebug(`Block ${index} rendered OK!`);

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
  }, []);

  // Use useLayoutEffect for synchronous DOM processing after render
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Try to process immediately
    processMermaidBlocks();

    // Also retry after a short delay to handle hydration timing issues
    const retryTimeout = setTimeout(() => {
      if (!initializedRef.current) {
        logDebug('Retry 1 (100ms)...');
        processMermaidBlocks();
      }
    }, 100);

    // And another retry after more time for slow-loading content
    const secondRetryTimeout = setTimeout(() => {
      if (!initializedRef.current) {
        logDebug('Retry 2 (500ms)...');
        processMermaidBlocks();
      }
    }, 500);

    return () => {
      clearTimeout(retryTimeout);
      clearTimeout(secondRetryTimeout);
    };
  }, [processMermaidBlocks]);

  // Also use useEffect as backup with MutationObserver for any async content loading
  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;

    // Set up observer for content changes
    const observer = new MutationObserver(() => {
      processMermaidBlocks();
      if (initializedRef.current) {
        observer.disconnect();
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [children, processMermaidBlocks]);

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
