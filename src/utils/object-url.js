/**
 * Object URL Utility
 * Fetches and caches URLs for interactive objects to be displayed in iframes
 */

import axios from "../axios";

// Cache for object URLs to avoid repeated API calls
const urlCache = new Map();

// Cache expiry time (30 minutes)
const CACHE_EXPIRY_MS = 30 * 60 * 1000;

// Cache entry structure: { url: string, timestamp: number }
const cacheEntries = new Map();

/**
 * Configuration for URL construction
 * Adjust these based on your backend API structure
 */
const URL_CONFIG = {
  // Base path for object player (if using client-side routing)
  PLAYER_BASE_PATH: "/play",

  // Fallback player route if object doesn't have a URL
  FALLBACK_PLAYER: "/object-player",

  // Whether to use external player URLs from API
  USE_API_URL: true,

  // Whether to construct URLs client-side from object type
  CONSTRUCT_FROM_TYPE: true,
};

/**
 * Get playable URL from object ID
 *
 * This function tries multiple strategies to get a URL:
 * 1. Check cache first
 * 2. Fetch object data from API
 * 3. Use direct URL from object if available
 * 4. Construct URL from object type and ID
 * 5. Fallback to generic player
 *
 * @param {string} objectId - Interactive object ID
 * @returns {Promise<string>} - URL to display in iframe
 * @throws {Error} - If URL cannot be determined
 */
export const getObjectUrl = async (objectId) => {
  if (!objectId) {
    throw new Error("Object ID is required");
  }

  console.log("Getting URL for object:", objectId);

  // Check cache first
  const cached = getCachedUrl(objectId);
  if (cached) {
    console.log("Using cached URL:", cached);
    return cached;
  }

  try {
    // Fetch object data from API
    console.log("Fetching object data from API...");
    const response = await axios.get(`/interactive-objects/${objectId}`);
    const objectData = response.data;

    console.log("Object data received:", objectData);

    let url = null;

    // Strategy 1: Use direct URL from API response
    // Check common URL field names
    if (URL_CONFIG.USE_API_URL) {
      url =
        objectData.playUrl ||
        objectData.url ||
        objectData.embedUrl ||
        objectData.playerUrl ||
        objectData.contentUrl;

      if (url) {
        console.log("Found direct URL in object data:", url);
        setCachedUrl(objectId, url);
        return url;
      }
    }

    // Strategy 2: Construct URL from object type
    if (URL_CONFIG.CONSTRUCT_FROM_TYPE && objectData.type) {
      // Convert type to URL-friendly format
      const typeSlug = objectData.type
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      url = `${URL_CONFIG.PLAYER_BASE_PATH}/${typeSlug}/${objectId}`;
      console.log("Constructed URL from type:", url);
      setCachedUrl(objectId, url);
      return url;
    }

    // Strategy 3: Use object name as route (if available)
    if (objectData.name || objectData.questionName) {
      const nameSlug = (objectData.name || objectData.questionName)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .substring(0, 50); // Limit length

      url = `${URL_CONFIG.PLAYER_BASE_PATH}/${nameSlug}/${objectId}`;
      console.log("Constructed URL from name:", url);
      setCachedUrl(objectId, url);
      return url;
    }

    // Strategy 4: Check if object has embedded content
    if (objectData.embedCode || objectData.htmlContent) {
      // Create data URL with HTML content
      const htmlContent = objectData.embedCode || objectData.htmlContent;
      url = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      console.log("Using embedded HTML content");
      setCachedUrl(objectId, url);
      return url;
    }

    // Strategy 5: Fallback to generic player with object ID
    url = `${URL_CONFIG.FALLBACK_PLAYER}/${objectId}`;
    console.log("Using fallback player URL:", url);
    setCachedUrl(objectId, url);
    return url;
  } catch (error) {
    console.error("Failed to fetch object URL:", error);

    // Check if it's a 404 error
    if (error.response && error.response.status === 404) {
      throw new Error("Object not found");
    }

    // Check if it's a network error
    if (error.message === "Network Error") {
      throw new Error("Network error. Please check your connection.");
    }

    // Generic error
    throw new Error("Could not load object URL");
  }
};

/**
 * Get object data without URL (for display purposes)
 *
 * @param {string} objectId - Interactive object ID
 * @returns {Promise<Object>} - Object data
 */
export const getObjectData = async (objectId) => {
  if (!objectId) {
    throw new Error("Object ID is required");
  }

  try {
    const response = await axios.get(`/interactive-objects/${objectId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch object data:", error);
    throw error;
  }
};

/**
 * Get cached URL if available and not expired
 *
 * @param {string} objectId - Interactive object ID
 * @returns {string|null} - Cached URL or null
 */
const getCachedUrl = (objectId) => {
  const entry = cacheEntries.get(objectId);

  if (!entry) {
    return null;
  }

  // Check if cache entry has expired
  const now = Date.now();
  if (now - entry.timestamp > CACHE_EXPIRY_MS) {
    console.log("Cache expired for object:", objectId);
    cacheEntries.delete(objectId);
    return null;
  }

  return entry.url;
};

/**
 * Set cached URL with timestamp
 *
 * @param {string} objectId - Interactive object ID
 * @param {string} url - URL to cache
 */
const setCachedUrl = (objectId, url) => {
  cacheEntries.set(objectId, {
    url: url,
    timestamp: Date.now(),
  });
};

/**
 * Clear URL cache (useful for testing or forcing refresh)
 *
 * @param {string} objectId - Optional specific object ID to clear
 */
export const clearUrlCache = (objectId) => {
  if (objectId) {
    console.log("Clearing cache for object:", objectId);
    cacheEntries.delete(objectId);
  } else {
    console.log("Clearing entire URL cache");
    cacheEntries.clear();
  }
};

/**
 * Prefetch URLs for multiple objects (useful for performance)
 *
 * @param {Array<string>} objectIds - Array of object IDs
 * @returns {Promise<Object>} - Map of objectId to URL
 */
export const prefetchObjectUrls = async (objectIds) => {
  console.log("Prefetching URLs for objects:", objectIds);

  const results = {};

  await Promise.allSettled(
    objectIds.map(async (objectId) => {
      try {
        const url = await getObjectUrl(objectId);
        results[objectId] = { success: true, url };
      } catch (error) {
        results[objectId] = { success: false, error: error.message };
      }
    })
  );

  return results;
};

/**
 * Get cache statistics (useful for debugging)
 *
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  cacheEntries.forEach((entry) => {
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  });

  return {
    totalEntries: cacheEntries.size,
    validEntries,
    expiredEntries,
    expiryTimeMs: CACHE_EXPIRY_MS,
  };
};

/**
 * Configure URL construction options
 * Call this at app initialization to configure behavior
 *
 * @param {Object} config - Configuration options
 * @param {string} config.playerBasePath - Base path for player routes
 * @param {string} config.fallbackPlayer - Fallback player route
 * @param {boolean} config.useApiUrl - Whether to use URLs from API
 * @param {boolean} config.constructFromType - Whether to construct URLs from type
 */
export const configureObjectUrl = (config) => {
  if (config.playerBasePath !== undefined) {
    URL_CONFIG.PLAYER_BASE_PATH = config.playerBasePath;
  }
  if (config.fallbackPlayer !== undefined) {
    URL_CONFIG.FALLBACK_PLAYER = config.fallbackPlayer;
  }
  if (config.useApiUrl !== undefined) {
    URL_CONFIG.USE_API_URL = config.useApiUrl;
  }
  if (config.constructFromType !== undefined) {
    URL_CONFIG.CONSTRUCT_FROM_TYPE = config.constructFromType;
  }

  console.log("Object URL configuration updated:", URL_CONFIG);
};

/**
 * Validate if a URL is safe to display in iframe
 *
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is safe
 */
export const isSafeUrl = (url) => {
  if (!url) return false;

  try {
    // Allow relative URLs
    if (url.startsWith("/")) return true;

    // Allow data URLs (for embedded content)
    if (url.startsWith("data:")) return true;

    // Validate absolute URLs
    const urlObj = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      console.warn("Unsafe URL protocol:", urlObj.protocol);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid URL:", error);
    return false;
  }
};

// Export configuration for reference
export const getUrlConfig = () => ({ ...URL_CONFIG });

// Development helpers (only available in development mode)
if (process.env.NODE_ENV === "development") {
  // Expose utilities to window for debugging
  window.objectUrlUtils = {
    getObjectUrl,
    clearUrlCache,
    getCacheStats,
    prefetchObjectUrls,
    configureObjectUrl,
    getUrlConfig,
    isSafeUrl,
  };

  // console.log(
  //   "💡 Object URL utilities available in development mode via window.objectUrlUtils"
  // );
}
