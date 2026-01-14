'use client';

import { useEffect, useRef } from 'react';

interface CodeBlockWrapperProps {
  children: React.ReactNode;
}

export function CodeBlockWrapper({ children }: CodeBlockWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find all pre elements (code blocks from rehype-pretty-code)
    const preElements = containerRef.current.querySelectorAll('pre');

    preElements.forEach((pre) => {
      // Skip if already processed
      if (pre.querySelector('.copy-code-btn')) return;

      // Add relative positioning and group for hover
      pre.classList.add('group', 'relative');

      // Get the code content
      const codeElement = pre.querySelector('code');
      if (!codeElement) return;

      // Create copy button
      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.setAttribute('aria-label', 'Copy code');
      button.setAttribute('title', 'Copy code');
      button.innerHTML = getCopyIcon();

      button.addEventListener('click', async () => {
        const code = codeElement.textContent || '';
        try {
          await navigator.clipboard.writeText(code);
          button.innerHTML = getCheckIcon();
          button.classList.add('copied');
          setTimeout(() => {
            button.innerHTML = getCopyIcon();
            button.classList.remove('copied');
          }, 2000);
        } catch {
          console.error('Failed to copy code');
        }
      });

      pre.appendChild(button);
    });
  }, [children]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

function getCopyIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
}

function getCheckIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}

export default CodeBlockWrapper;
