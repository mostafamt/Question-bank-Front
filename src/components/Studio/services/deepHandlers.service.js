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
 * typeOfLabel -> handler. A missing key means the default path applies.
 * @type {Object<string, function(DeepHandlerContext): void|Promise<void>>}
 */
const DEEP_HANDLERS = {
  text: handleDeepText,
};

/**
 * Resolve the deep handler for a block, or null when the default path applies.
 * @param {Object} area - The areaProperty
 * @param {string} labelType - Resolved typeOfLabel
 * @returns {Function|null} Handler, or null
 */
export const getDeepHandler = (area, labelType) =>
  (isDeepBlock(area) && DEEP_HANDLERS[labelType]) || null;

export default {
  getDeepHandler,
};
