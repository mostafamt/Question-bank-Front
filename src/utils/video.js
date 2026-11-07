/**
 * Convert video URLs to embeddable format
 * Supports: YouTube, Vimeo
 *
 * @param {string} url - Original URL
 * @returns {string} - Embeddable URL
 */
export const getEmbedUrl = (url) => {
  if (!url) return url;

  try {
    const urlObj = new URL(url);

    // YouTube - youtu.be format
    if (urlObj.hostname === "youtu.be") {
      const videoId = urlObj.pathname.slice(1).split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // YouTube - youtube.com/watch format
    if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com" ||
      urlObj.hostname === "m.youtube.com"
    ) {
      if (urlObj.pathname === "/watch") {
        const videoId = urlObj.searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      // Already embed format
      if (urlObj.pathname.startsWith("/embed/")) {
        return url;
      }
    }

    // Vimeo
    if (
      urlObj.hostname === "vimeo.com" ||
      urlObj.hostname === "www.vimeo.com"
    ) {
      const videoId = urlObj.pathname.slice(1);
      if (videoId && !urlObj.pathname.startsWith("/video/")) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // Return original URL if no conversion needed
    return url;
  } catch (e) {
    // Invalid URL, return as-is
    return url;
  }
};

/**
 * Extract the video ID from a YouTube URL (watch, youtu.be or embed format)
 *
 * @param {string} url
 * @returns {string|null} - Video ID, or null if the URL isn't a YouTube video
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);

    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1).split("/")[0] || null;
    }

    if (/(^|\.)youtube\.com$/.test(urlObj.hostname)) {
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      if (urlObj.pathname.startsWith("/embed/")) {
        return urlObj.pathname.split("/")[2] || null;
      }
    }

    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Thumbnail image for a YouTube video. Served by i.ytimg.com with
 * `Access-Control-Allow-Origin: *`, so it can be drawn onto a canvas.
 *
 * @param {string} url - YouTube video URL
 * @returns {string|null} - Thumbnail URL, or null if not a YouTube video
 */
export const getYouTubeThumbnailUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
};

/**
 * Whether the URL points to a hosted player (YouTube/Vimeo) that must be
 * rendered in an iframe rather than a native <video> element.
 *
 * @param {string} url
 * @returns {boolean}
 */
export const isEmbeddableVideoUrl = (url) => {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return /(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/.test(hostname);
  } catch (e) {
    return false;
  }
};
