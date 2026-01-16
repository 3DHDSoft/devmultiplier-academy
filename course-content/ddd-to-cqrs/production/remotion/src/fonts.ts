import { continueRender, delayRender } from 'remotion';

// Load Inter font from Google Fonts for consistent rendering
// Using font-display: block ensures text doesn't render until font is loaded
const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=block';

let fontLoaded = false;

export const loadFonts = async () => {
  if (fontLoaded) return;

  const handle = delayRender('Loading fonts...');

  try {
    // Create a link element to load the Google Font CSS
    const link = document.createElement('link');
    link.href = fontUrl;
    link.rel = 'stylesheet';

    // Wait for the stylesheet to load
    await new Promise<void>((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load fonts'));
      document.head.appendChild(link);
    });

    // Wait for fonts to actually be ready
    await document.fonts.ready;

    // Additional wait to ensure font metrics are calculated
    await new Promise((resolve) => setTimeout(resolve, 100));

    fontLoaded = true;
  } finally {
    continueRender(handle);
  }
};

// Font family string to use in components
// Include emoji fonts for cross-platform emoji rendering
export const fontFamily = "'Inter', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', system-ui, -apple-system, sans-serif";
