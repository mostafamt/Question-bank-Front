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
import { STUDIO_MODALS, COMPLEX_AREA_TYPES } from "./modal.service";

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
const handleDeepText = ({
  area,
  labelType,
  updateAreaPropertyById,
  openModal,
}) => {
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
 * Deep + audio: the author uploads/pastes an audio URL via a modal.
 * The chosen URL is written back to area.audio.
 * @param {DeepHandlerContext} context
 */
const handleDeepAudio = ({ area, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.DEEP_AUDIO, {
    workingArea: {
      id: area.id,
      audio: area.audio,
    },
    updateAreaPropertyById,
  });
};

/**
 * Deep + video: the author uploads/pastes a video URL via a modal.
 * The chosen URL is written back to area.video.
 * @param {DeepHandlerContext} context
 */
const handleDeepVideo = ({ area, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.DEEP_VIDEO, {
    workingArea: {
      id: area.id,
      video: area.video,
    },
    updateAreaPropertyById,
  });
};

/**
 * Deep + object (Question / Illustrative Object): the author links an existing
 * interactive object from the library rather than auto-generating one from the
 * OCR crop. The chosen ID is written back to area.text — the same field used by
 * the non-deep path — so playback via PlayObjectModal2 works identically.
 * @param {DeepHandlerContext} context
 */
const handleDeepObject = ({ area, updateAreaPropertyById, openModal }) => {
  openModal("select-from-library", {
    onSelect: (objectId) => {
      updateAreaPropertyById(area.id, { text: objectId });
    },
  });
};

/**
 * typeOfLabel -> handler. A missing key means the default path applies.
 * @type {Object<string, function(DeepHandlerContext): void|Promise<void>>}
 */
const DEEP_HANDLERS = {
  text: handleDeepText,
  image: handleDeepImage,
  audio: handleDeepAudio,
  video: handleDeepVideo,
};

/**
 * Resolve the deep handler for a block, or null when the default path applies.
 * Primitive types (text/image/audio/video) are matched by exact labelType key.
 * Object blocks are matched by area.type category so that all object label
 * variants (Text MCQ, Essay, TrueFalse, …) share one handler.
 * @param {Object} area - The areaProperty
 * @param {string} labelType - Resolved typeOfLabel
 * @returns {Function|null} Handler, or null
 */
export const getDeepHandler = (area, labelType) => {
  if (!isDeepBlock(area)) return null;
  if (DEEP_HANDLERS[labelType]) return DEEP_HANDLERS[labelType];
  if (COMPLEX_AREA_TYPES.includes(area?.type)) return handleDeepObject;
  return null;
};

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

/**
 * The author-provided audio URL to paint over a deep audio block's area, or "".
 * @param {Object} area - The areaProperty
 * @returns {string} Audio URL, or "" when nothing should be painted
 */
export const getDeepBlockAudio = (area) =>
  isDeepBlock(area) &&
  area?.typeOfLabel === "audio" &&
  typeof area.audio === "string" &&
  area.audio
    ? area.audio
    : "";

/**
 * The author-provided video URL to paint over a deep video block's area, or "".
 * @param {Object} area - The areaProperty
 * @returns {string} Video URL, or "" when nothing should be painted
 */
export const getDeepBlockVideo = (area) =>
  isDeepBlock(area) &&
  area?.typeOfLabel === "video" &&
  typeof area.video === "string" &&
  area.video
    ? area.video
    : "";

/**
 * The linked object ID for a deep object block, or "" when nothing is linked.
 * Returns the value stored in area.text (same field used by the non-deep path)
 * so that playback via determineModalForArea / PlayObjectModal2 is unchanged.
 * @param {Object} area - The areaProperty
 * @returns {string} Object ID, or "" when nothing is linked
 */
export const getDeepBlockObject = (area) =>
  isDeepBlock(area) &&
  COMPLEX_AREA_TYPES.includes(area?.type) &&
  typeof area.text === "string" &&
  area.text
    ? area.text
    : "";

const deepHandlersService = {
  getDeepHandler,
  getDeepBlockText,
  getDeepBlockImage,
  getDeepBlockAudio,
  getDeepBlockVideo,
  getDeepBlockObject,
};

export default deepHandlersService;
