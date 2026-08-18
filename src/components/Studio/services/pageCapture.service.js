/**
 * @fileoverview Page snapshot capture service for deep blocks
 * Captures a rendered page container (base image + deep block overlays)
 * with authoring UI chrome (area borders/backgrounds) stripped out.
 *
 * The snapshot includes white background overlays for deleted deep blocks,
 * ensuring the final image shows deleted areas as white/empty rather than
 * showing the underlying page content.
 */

import html2canvas from 'html2canvas';

/**
 * Captures a page container as a PNG snapshot, excluding area selection borders/backgrounds
 * but preserving white area overlays for deleted deep blocks.
 *
 * @param {HTMLElement|null} containerEl - The rendered container div (`.block` wrapper)
 * @returns {Promise<string|null>} Data URL (PNG) or null if container is falsy
 *
 * **Content Captured:**
 * - Base page image (`<img>` element)
 * - White area overlays for deleted deep blocks (class: `white-area-overlay`)
 * - Deep block content (text, images, audio, video, objects)
 *
 * **Content Stripped:**
 * - Area selection borders and backgrounds (styling UI only)
 * - Region highlights and interactive indicators
 *
 * **Structure:**
 * ```
 * <div class="block" ref={pageContainerRef}>
 *   <div style={{ position: "relative" }}>
 *     <WhiteAreaOverlay /> ← Preserved in snapshot
 *     <AreaSelector or area divs /> ← Borders/backgrounds stripped
 *     <img /> ← Preserved in snapshot
 *   </div>
 * </div>
 * ```
 *
 * @note White areas are NOT direct children of containerEl, so they're not
 * affected by the onclone hook that strips styling from direct children.
 *
 * **Limitation:** Cross-origin `<iframe>` content (e.g., `DeepBlockObject`)
 * cannot be rasterized by html2canvas and will appear blank in the snapshot.
 */
export async function capturePageSnapshot(containerEl) {
  if (!containerEl) {
    return null;
  }

  try {
    const canvas = await html2canvas(containerEl, {
      useCORS: true,
      backgroundColor: null,
      allowTaint: true,
      onclone: (clonedDoc, clonedEl) => {
        // IMPORTANT: Process white areas FIRST to preserve them
        // Find all white area overlays in the cloned tree
        const whiteAreas = Array.from(clonedEl.querySelectorAll('.white-area-overlay'));

        // Ensure white areas are visible and will be captured
        whiteAreas.forEach((whiteArea) => {
          whiteArea.style.setProperty('display', 'block', 'important');
          whiteArea.style.setProperty('visibility', 'visible', 'important');
          whiteArea.style.setProperty('opacity', '1', 'important');
          whiteArea.style.setProperty('background-color', '#ffffff', 'important');
          whiteArea.style.setProperty('position', 'absolute', 'important');
          whiteArea.style.setProperty('pointer-events', 'none', 'important');
        });

        // Hide the manual white-out delete buttons — they're authoring UI
        // chrome, not page content, so they must not end up in the snapshot.
        Array.from(clonedEl.querySelectorAll('.white-area-delete-btn')).forEach(
          (deleteBtn) => {
            deleteBtn.style.setProperty('display', 'none', 'important');
          }
        );

        // Now strip area selection styling from area boxes (NOT white areas)
        // These are typically the AreaSelector-generated divs with borders
        Array.from(clonedEl.querySelectorAll('[style*="border"], [style*="background"]')).forEach(
          (element) => {
            // Skip white area overlays - they should have already been set up above
            if (element.classList?.contains('white-area-overlay')) {
              return;
            }

            // Check if this looks like an area selection box
            // (has border or background styling from area selection)
            const computedStyle = window.getComputedStyle(element);
            const hasBorder = computedStyle.border !== 'none' && computedStyle.borderWidth !== '0px';
            const hasBackground =
              computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
              computedStyle.backgroundColor !== 'transparent';

            // Only strip if it has area selection styling (not regular content)
            if ((hasBorder || hasBackground) && !element.querySelector('img')) {
              element.style.setProperty('border', 'none', 'important');
              element.style.setProperty('background-color', 'transparent', 'important');
              element.style.setProperty('box-shadow', 'none', 'important');
            }
          }
        );
      },
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing page snapshot:', error);
    return null;
  }
}
