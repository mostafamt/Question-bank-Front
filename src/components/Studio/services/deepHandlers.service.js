/**
 * @file deepHandlers.service.js
 * @description Per-typeOfLabel handlers for blocks marked "deep" (isDeep === true).
 *
 * A deep block replaces the default label-selection behaviour rather than adding to it:
 * a deep text block opens the Quill editor for the author to type the text, instead of
 * running OCR on the cropped area. A typeOfLabel with no handler registered here keeps
 * its default behaviour.
 */

import { isDeepBlock } from "../utils";
import { STUDIO_MODALS } from "./modal.service";

/**
 * @typedef {Object} DeepHandlerContext
 * @property {Object} area - The areaProperty being labelled
 * @property {number} idx - Index of the area on the active page
 * @property {string} labelType - Resolved typeOfLabel
 * @property {string} image - Cropped image data URL
 * @property {Function} updateAreaPropertyById - Update callback (by id, safe to defer)
 * @property {Function} openModal - Open modal function
 */

/**
 * Deep + text: the author writes the text in Quill rather than OCR-ing the crop.
 * @param {DeepHandlerContext} context
 */
const handleDeepText = ({ area, labelType, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.QUILL, {
    workingArea: {
      id: area.id,
      blockId: area.blockId,
      contentType: area.type,
      text: area.text || "",
      typeOfLabel: labelType,
    },
    updateAreaPropertyById,
  });
};

/**
 * Deep + image: the author uploads/replaces the image via a modal rather than
 * using the OCR crop. The chosen URL is written back to area.image.
 * @param {DeepHandlerContext} context
 */
const handleDeepImage = ({ area, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.DEEP_IMAGE, {
    workingArea: {
      id: area.id,
      image: area.image,
    },
    updateAreaPropertyById,
  });
};

/**
 * typeOfLabel -> handler. A missing key means the default path applies.
 * @type {Object<string, function(DeepHandlerContext): void|Promise<void>>}
 */
const DEEP_HANDLERS = {
  text: handleDeepText,
  image: handleDeepImage,
};

/**
 * Resolve the deep handler for a block, or null when the default path applies.
 * @param {Object} area - The areaProperty
 * @param {string} labelType - Resolved typeOfLabel
 * @returns {Function|null} Handler, or null
 */
export const getDeepHandler = (area, labelType) =>
  (isDeepBlock(area) && DEEP_HANDLERS[labelType]) || null;

/**
 * The authored HTML to paint over a block's area, or "" when the block is not a
 * deep text block. Deep text is authored rather than OCR'd, so it is the only
 * content that replaces what the scan shows underneath.
 * @param {Object} area - The areaProperty
 * @returns {string} HTML, or "" when nothing should be painted
 */
export const getDeepBlockText = (area) =>
  isDeepBlock(area) && area?.typeOfLabel === "text" ? area.text || "" : "";

/**
 * The author-provided image URL to paint over a deep image block's area, or "".
 * Only a hosted URL counts — a data: crop is the raw scan, not a chosen
 * replacement, so it is not painted over itself.
 * @param {Object} area - The areaProperty
 * @returns {string} Image URL, or "" when nothing should be painted
 */
export const getDeepBlockImage = (area) =>
  isDeepBlock(area) &&
  area?.typeOfLabel === "image" &&
  typeof area.image === "string" &&
  !area.image.startsWith("data:")
    ? area.image
    : "";

export default {
  getDeepHandler,
  getDeepBlockText,
  getDeepBlockImage,
};
