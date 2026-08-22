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
 * Ensures every <video> in the container has actually painted a frame.
 *
 * Submitting toggles `showBlocksStyling` off to strip authoring chrome for
 * the capture, which switches StudioAreaSelector from its edit-mode renderer
 * (the third-party AreaSelector library) to BlockOverlayLayer for
 * view-and-play — a different component tree, so React remounts a brand
 * new `<video>` element right before we capture, even if the same video was
 * already loaded/playing a moment earlier under the library's renderer.
 *
 * A fresh `<video>` with no `preload`/`autoPlay` (see DeepBlockVideo) may
 * only have fetched metadata (readyState 1), not a decoded frame — and on
 * some browsers/codecs, reaching readyState 2 (HAVE_CURRENT_DATA) still
 * doesn't guarantee a frame was actually decoded/painted until playback
 * starts. So we wait for a decodable frame, then briefly play (muted) and
 * pause to force one to actually paint.
 *
 * @param {HTMLElement} containerEl
 * @returns {Promise<void>}
 */
async function ensureVideoFramesReady(containerEl) {
  const videos = Array.from(containerEl.querySelectorAll('video'));
  await Promise.all(videos.map(forceVideoFramePaint));
}

function forceVideoFramePaint(video) {
  if (video.readyState >= 2) {
    return paintOneFrame(video);
  }

  return new Promise((resolve) => {
    // Don't let a stalled/broken video source block the whole snapshot.
    const timeout = setTimeout(finish, 3000);

    function onLoadedData() {
      paintOneFrame(video).then(finish);
    }

    function finish() {
      clearTimeout(timeout);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', finish);
      resolve();
    }

    video.addEventListener('loadeddata', onLoadedData, { once: true });
    video.addEventListener('error', finish, { once: true });
  });
}

function paintOneFrame(video) {
  // Muted so the browser's autoplay policy can't block this, and so
  // playing/pausing a video the author never pressed play on stays silent.
  video.muted = true;

  return Promise.resolve(video.play()).then(
    () => new Promise((resolve) => setTimeout(resolve, 50)).then(() => video.pause()),
    () => {
      // play() rejected (e.g. NotAllowedError) — fall back to whatever
      // frame, if any, is already decoded.
    }
  );
}

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
 * @note html2canvas cannot rasterize `<video>` elements — it only paints
 * normal DOM/CSS content, not video frames. `DeepBlockVideo` renders a real
 * `<video>` tag, so before rasterizing we draw each video's current frame
 * onto an offscreen canvas and swap the cloned `<video>` for an `<img>` of
 * that frame, which html2canvas renders like any other image.
 *
 * **Limitation:** Cross-origin `<iframe>` content (e.g., `DeepBlockObject`)
 * cannot be rasterized by html2canvas and will appear blank in the snapshot.
 */
export async function capturePageSnapshot(containerEl) {
  if (!containerEl) {
    return null;
  }

  try {
    await ensureVideoFramesReady(containerEl);

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

        // html2canvas can't rasterize <video> elements at all, so swap each
        // cloned video for an <img> of its current decoded frame. Matched by
        // index since the clone preserves document order.
        const originalVideos = Array.from(containerEl.querySelectorAll('video'));
        Array.from(clonedEl.querySelectorAll('video')).forEach((clonedVideo, index) => {
          const originalVideo = originalVideos[index];
          const width = originalVideo?.videoWidth;
          const height = originalVideo?.videoHeight;

          // readyState < 2 (HAVE_CURRENT_DATA) means no decoded frame exists
          // yet — leave the video element in place rather than draw a black frame.
          if (!originalVideo || !width || !height || originalVideo.readyState < 2) {
            return;
          }

          try {
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = width;
            frameCanvas.height = height;
            frameCanvas.getContext('2d').drawImage(originalVideo, 0, 0, width, height);

            const frameImg = clonedDoc.createElement('img');
            frameImg.src = frameCanvas.toDataURL('image/png');
            frameImg.className = clonedVideo.className;

            clonedVideo.replaceWith(frameImg);
          } catch (error) {
            // A cross-origin video without proper CORS headers taints the
            // canvas — leave the video element in place rather than fail
            // the whole snapshot.
            console.error('Error capturing video frame for snapshot:', error);
          }
        });

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
