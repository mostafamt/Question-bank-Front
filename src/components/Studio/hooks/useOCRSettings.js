import React from "react";
import { OCR_LANGUAGES, LANGUAGE_CODES } from "../constants";
import {
  ocr,
  extractImage,
  ARABIC,
  ENGLISH,
} from "../../../utils/ocr";

/**
 * @typedef {'eng'|'ara'} OCRLanguage
 * @description Language code for OCR processing
 */

/**
 * @typedef {'en'|'ar'} LanguageCode
 * @description ISO language code
 */

/**
 * Hook for managing OCR settings and operations
 * @param {Object} params - Hook parameters
 * @param {string} [params.initialLanguage] - Initial language code ('en' or 'ar')
 * @param {React.RefObject} [params.canvasRef] - Reference to canvas element for image extraction
 * @param {React.RefObject} [params.imageRef] - Reference to image element
 * @returns {Object} OCR settings and utilities
 */
const useOCRSettings = ({
  initialLanguage = LANGUAGE_CODES.ENGLISH,
  canvasRef,
  imageRef,
} = {}) => {
  // Convert initial language code to OCR language
  const [language, setLanguage] = React.useState(() => {
    return initialLanguage === LANGUAGE_CODES.ENGLISH ? ENGLISH : ARABIC;
  });

  // Loading state for OCR operations
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Error state for OCR operations
  const [ocrError, setOcrError] = React.useState(null);

  /**
   * Get the ISO language code from current OCR language
   * @returns {LanguageCode} ISO language code
   */
  const languageCode = React.useMemo(() => {
    return language === ENGLISH ? LANGUAGE_CODES.ENGLISH : LANGUAGE_CODES.ARABIC;
  }, [language]);

  /**
   * Check if current language is RTL (Right-to-Left)
   * @returns {boolean} True if language is RTL
   */
  const isRTL = React.useMemo(() => {
    return language === ARABIC;
  }, [language]);

  /**
   * Set language to English
   */
  const setEnglish = React.useCallback(() => {
    setLanguage(ENGLISH);
  }, []);

  /**
   * Set language to Arabic
   */
  const setArabic = React.useCallback(() => {
    setLanguage(ARABIC);
  }, []);

  /**
   * Toggle between English and Arabic
   */
  const toggleLanguage = React.useCallback(() => {
    setLanguage((prev) => (prev === ENGLISH ? ARABIC : ENGLISH));
  }, []);

  /**
   * Set language from ISO language code
   * @param {LanguageCode} code - ISO language code ('en' or 'ar')
   */
  const setLanguageFromCode = React.useCallback((code) => {
    setLanguage(code === LANGUAGE_CODES.ENGLISH ? ENGLISH : ARABIC);
  }, []);

  /**
   * Perform OCR on an image
   * @param {string} imageData - Image data URL or base64 string
   * @param {OCRLanguage} [lang] - Optional language override
   * @returns {Promise<string>} Extracted text
   */
  const performOCR = React.useCallback(
    async (imageData, lang = language) => {
      if (!imageData) {
        console.warn("No image data provided for OCR");
        return "";
      }

      setIsProcessing(true);
      setOcrError(null);

      try {
        const text = await ocr(lang, imageData);
        return text;
      } catch (error) {
        console.error("OCR error:", error);
        setOcrError(error.message || "OCR processing failed");
        return "";
      } finally {
        setIsProcessing(false);
      }
    },
    [language]
  );

  /**
   * Extract image from a specific area and perform OCR
   * @param {Object} params - Extraction parameters
   * @param {Object[]} params.areasProperties - Areas properties array
   * @param {number} params.activePage - Active page index
   * @param {Object[]} params.areas - Areas array
   * @param {string} params.areaId - ID of the area to extract
   * @returns {Promise<{image: string, text: string}>} Extracted image and text
   */
  const extractAndOCR = React.useCallback(
    async ({ areasProperties, activePage, areas, areaId }) => {
      if (!canvasRef?.current || !imageRef?.current) {
        console.warn("Canvas or image ref not available");
        return { image: "", text: "" };
      }

      setIsProcessing(true);
      setOcrError(null);

      try {
        // Extract the image
        const image = extractImage(
          canvasRef,
          imageRef,
          areasProperties,
          activePage,
          areas,
          areaId
        );

        // Perform OCR
        const text = await ocr(language, image);

        return { image, text };
      } catch (error) {
        console.error("Extract and OCR error:", error);
        setOcrError(error.message || "Image extraction or OCR failed");
        return { image: "", text: "" };
      } finally {
        setIsProcessing(false);
      }
    },
    [canvasRef, imageRef, language]
  );

  /**
   * Extract image from area without OCR
   * @param {Object} params - Extraction parameters
   * @param {Object[]} params.areasProperties - Areas properties array
   * @param {number} params.activePage - Active page index
   * @param {Object[]} params.areas - Areas array
   * @param {string} params.areaId - ID of the area to extract
   * @returns {string} Extracted image data URL
   */
  const extractImageFromArea = React.useCallback(
    ({ areasProperties, activePage, areas, areaId }) => {
      if (!canvasRef?.current || !imageRef?.current) {
        console.warn("Canvas or image ref not available");
        return "";
      }

      try {
        return extractImage(
          canvasRef,
          imageRef,
          areasProperties,
          activePage,
          areas,
          areaId
        );
      } catch (error) {
        console.error("Image extraction error:", error);
        return "";
      }
    },
    [canvasRef, imageRef]
  );

  /**
   * Clear OCR error
   */
  const clearError = React.useCallback(() => {
    setOcrError(null);
  }, []);

  return {
    // State
    language,
    setLanguage,
    languageCode,
    isRTL,
    isProcessing,
    ocrError,

    // Language actions
    setEnglish,
    setArabic,
    toggleLanguage,
    setLanguageFromCode,

    // OCR actions
    performOCR,
    extractAndOCR,
    extractImageFromArea,
    clearError,

    // Constants (for convenience)
    OCR_LANGUAGES,
    LANGUAGE_CODES,
  };
};

export default useOCRSettings;
