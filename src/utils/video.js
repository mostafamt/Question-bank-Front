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
