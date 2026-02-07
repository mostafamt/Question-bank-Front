/**
 * @file ocr.service.js
 * @description OCR (Optical Character Recognition) service for Studio component
 * Handles text extraction from images, image cropping, and OCR processing
 *
 * This service wraps the core OCR utilities and provides Studio-specific
 * functionality for extracting text from selected areas.
 */

import { ocr, cropSelectedArea, extractImage } from "../../../utils/ocr";

/**
 * @typedef {Object} OCRResult
 * @property {string} text - Extracted text from image
 * @property {boolean} success - Whether OCR was successful
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {Object} ImageExtractionResult
 * @property {string} imageData - Base64 image data URL
 * @property {boolean} success - Whether extraction was successful
 * @property {string} [error] - Error message if failed
 */

/**
 * @typedef {'eng'|'ara'} OCRLanguage
 */

/**
 * Supported OCR languages
 */
export const OCR_LANGUAGES = {
  ENGLISH: "eng",
  ARABIC: "ara",
};

/**
 * Perform OCR on an image with error handling
 * @param {string} imageData - Base64 image data URL
 * @param {OCRLanguage} [language='eng'] - OCR language
 * @returns {Promise<OCRResult>} OCR result with extracted text
 */
export async function performOCR(imageData, language = OCR_LANGUAGES.ENGLISH) {
  if (!imageData) {
    return {
      text: "",
      success: false,
      error: "No image data provided",
    };
  }

  try {
    const text = await ocr(language, imageData);
    return {
      text: text || "",
      success: true,
    };
  } catch (error) {
    console.error("OCR processing failed:", error);
    return {
      text: "",
      success: false,
      error: error.message || "OCR processing failed",
    };
  }
}

/**
 * Crop a selected area from an image
 * @param {React.RefObject} canvasRef - Reference to canvas element
 * @param {React.RefObject} imageRef - Reference to image element
 * @param {Object} coordinates - Area coordinates
 * @param {number} coordinates.x - X position
 * @param {number} coordinates.y - Y position
 * @param {number} coordinates.width - Area width
 * @param {number} coordinates.height - Area height
 * @returns {ImageExtractionResult} Extraction result with image data
 */
export function cropAreaFromImage(canvasRef, imageRef, coordinates) {
  if (!canvasRef?.current || !imageRef?.current) {
    return {
      imageData: "",
      success: false,
      error: "Canvas or image reference not available",
    };
  }

  const { x, y, width, height } = coordinates;

  if (width <= 0 || height <= 0) {
    return {
      imageData: "",
      success: false,
      error: "Invalid area dimensions",
    };
  }

  try {
    const imageData = cropSelectedArea(canvasRef, imageRef, x, y, width, height);
    return {
      imageData,
      success: true,
    };
  } catch (error) {
    console.error("Image cropping failed:", error);
    return {
      imageData: "",
      success: false,
      error: error.message || "Image cropping failed",
    };
  }
}

/**
 * Extract image from a specific area in the Studio
 * @param {Object} params - Extraction parameters
 * @param {React.RefObject} params.canvasRef - Canvas reference
 * @param {React.RefObject} params.imageRef - Image reference
 * @param {Object[][]} params.areasProperties - Areas properties
 * @param {number} params.activePage - Active page index
 * @param {Object[][]} params.areas - Areas array
 * @param {string} params.areaId - ID of area to extract
 * @returns {ImageExtractionResult} Extraction result
 */
export function extractAreaImage({
  canvasRef,
  imageRef,
  areasProperties,
  activePage,
  areas,
  areaId,
}) {
  if (!canvasRef?.current || !imageRef?.current) {
    return {
      imageData: "",
      success: false,
      error: "Canvas or image reference not available",
    };
  }

  try {
    const imageData = extractImage(
      canvasRef,
      imageRef,
      areasProperties,
      activePage,
      areas,
      areaId
    );

    return {
      imageData,
      success: true,
    };
  } catch (error) {
    console.error("Area image extraction failed:", error);
    return {
      imageData: "",
      success: false,
      error: error.message || "Area image extraction failed",
    };
  }
}

/**
 * Extract image from area and perform OCR in one operation
 * @param {Object} params - Parameters
 * @param {React.RefObject} params.canvasRef - Canvas reference
 * @param {React.RefObject} params.imageRef - Image reference
 * @param {Object[][]} params.areasProperties - Areas properties
 * @param {number} params.activePage - Active page index
 * @param {Object[][]} params.areas - Areas array
 * @param {string} params.areaId - ID of area to extract
 * @param {OCRLanguage} [params.language='eng'] - OCR language
 * @returns {Promise<{image: string, text: string, success: boolean, error?: string}>}
 */
export async function extractAndOCR({
  canvasRef,
  imageRef,
  areasProperties,
  activePage,
  areas,
  areaId,
  language = OCR_LANGUAGES.ENGLISH,
}) {
  // First extract the image
  const extraction = extractAreaImage({
    canvasRef,
    imageRef,
    areasProperties,
    activePage,
    areas,
    areaId,
  });

  if (!extraction.success) {
    return {
      image: "",
      text: "",
      success: false,
      error: extraction.error,
    };
  }

  // Then perform OCR
  const ocrResult = await performOCR(extraction.imageData, language);

  return {
    image: extraction.imageData,
    text: ocrResult.text,
    success: ocrResult.success,
    error: ocrResult.error,
  };
}

/**
 * Calculate pixel coordinates from percentage for image extraction
 * @param {Object} area - Area with percentage coordinates
 * @param {HTMLImageElement} imageElement - Image element
 * @returns {Object} Pixel coordinates
 */
export function calculatePixelCoordinates(area, imageElement) {
  if (!imageElement) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const { clientWidth, clientHeight, naturalWidth } = imageElement;
  const ratio = naturalWidth / clientWidth;

  return {
    x: ((area.x * ratio) / 100) * clientWidth,
    y: ((area.y * ratio) / 100) * clientHeight,
    width: ((area.width * ratio) / 100) * clientWidth,
    height: ((area.height * ratio) / 100) * clientHeight,
  };
}

/**
 * Extract coordinate text from area position
 * Used for Coordinate type labels
 * @param {Object} area - Area object
 * @param {HTMLImageElement} imageElement - Image element
 * @returns {string} Formatted coordinate string
 */
export function extractCoordinateText(area, imageElement) {
  if (!imageElement) {
    return "x= 0; y= 0;";
  }

  const { naturalWidth, naturalHeight } = imageElement;
  const x = Math.round((area.x * naturalWidth) / 100);
  const y = Math.round((area.y * naturalHeight) / 100);

  return `x= ${x}; y= ${y};`;
}

export default {
  performOCR,
  cropAreaFromImage,
  extractAreaImage,
  extractAndOCR,
  calculatePixelCoordinates,
  extractCoordinateText,
  OCR_LANGUAGES,
};
