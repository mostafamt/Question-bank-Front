/**
 * @file narration.service.js
 * @description Pure helpers for reader narration: pick a block's recorded
 * audio for a language and build the playback queue of a page.
 */

/**
 * @param {Object} block - Raw page block from the pages API
 * @param {string} lang - Language code ("en", "ar", "fr", ...)
 * @returns {string|null} Audio URL, or null when the block has none for lang
 */
export const getNarrationUrl = (block, lang) =>
  block?.narration?.find((n) => n.language === lang)?.audio ?? null;

/**
 * A block is narrated only when it can be highlighted on the page: it needs
 * a blockId and a visible (non zero-size) area, plus audio for the language.
 * @param {Object} block
 * @param {string} lang
 * @returns {boolean}
 */
export const isNarratable = (block, lang) =>
  Boolean(block?.blockId) &&
  block.coordinates?.width > 0 &&
  block.coordinates?.height > 0 &&
  Boolean(getNarrationUrl(block, lang));

/**
 * @param {Object} page - Raw page ({ blocks: [...] })
 * @param {string} lang
 * @returns {{ blockId: string, url: string }[]} Blocks to narrate, in order
 */
export const buildPageQueue = (page, lang) =>
  (page?.blocks || [])
    .filter((block) => isNarratable(block, lang))
    .map((block) => ({
      blockId: block.blockId,
      url: getNarrationUrl(block, lang),
    }));
