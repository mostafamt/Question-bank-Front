/**
 * @file Studio Services Index
 * @description Barrel export for all Studio-related services
 */

// Coordinate conversion service (image-based recalculation)
export {
  validateRefAccess,
  shouldConvertArea,
  getOriginalPercentageCoords,
  processPageAreas,
  processAreasForImageLoad,
  createSafeOnImageLoad,
} from "./coordinate.service";

// Styling service (area box colors and highlighting)
export { constructBoxColors } from "./styling.service";

// OCR service (text extraction from images)
export {
  performOCR,
  cropAreaFromImage,
  extractAreaImage,
  extractAndOCR,
  calculatePixelCoordinates,
  extractCoordinateText,
  OCR_LANGUAGES,
} from "./ocr.service";

// Modal service (Studio modal management)
export {
  STUDIO_MODALS,
  createQuillModalProps,
  createSubObjectModalProps,
  createCompositeBlocksModalProps,
  createModalService,
  StudioModalService,
  determineModalForArea,
} from "./modal.service";

// Block service (block operations)
export {
  BLOCK_STATUS,
  findBlockById,
  findBlocksByType,
  findBlocksByPage,
  findActiveBlocks,
  validateBlock,
  transformBlockForSubmit,
  transformBlockFromServer,
  createBlock,
  updateBlockProperty,
  markBlockAsDeleted,
  removeBlock,
  getBlocksForSubmission,
  countBlocksByStatus,
} from "./block.service";
