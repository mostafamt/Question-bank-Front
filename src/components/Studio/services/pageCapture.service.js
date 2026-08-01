/**
 * @fileoverview Page snapshot capture service for deep blocks
 * Captures a rendered page container (base image + deep block overlays)
 * with authoring UI chrome (area borders/backgrounds) stripped out
 */

import html2canvas from 'html2canvas';

/**
 * Captures a page container as a PNG snapshot, excluding area selection borders/backgrounds
 * @param {HTMLElement|null} containerEl - The rendered container div (`.block` wrapper)
 * @returns {Promise<string|null>} Data URL (PNG) or null if container is falsy
 *
 * The container should include the base `<img>` and any nested deep-block content elements.
 * Area borders/backgrounds from `constructBoxColors()` and SCSS fallback are stripped via
 * the onclone hook, which walks direct children and forces their borders/backgrounds to transparent.
 *
 * **Limitation:** Cross-origin `<iframe>` content (e.g., `DeepBlockObject`) cannot be
 * rasterized by html2canvas and will appear blank in the snapshot.
 */
export async function capturePageSnapshot(containerEl) {
  if (!containerEl) {
    return null;
  }

  try {
    const canvas = await html2canvas(containerEl, {
      useCORS: true,
      backgroundColor: null,
      onclone: (clonedDoc, clonedEl) => {
        // Strip area selection borders/backgrounds from cloned direct children
        // (these are the react-image-area–generated area boxes; deep content inside is preserved)
        Array.from(clonedEl.children).forEach((child) => {
          child.style.setProperty('border', 'none', 'important');
          child.style.setProperty('background-color', 'transparent', 'important');
          child.style.setProperty('box-shadow', 'none', 'important');
        });
      },
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing page snapshot:', error);
    return null;
  }
}
