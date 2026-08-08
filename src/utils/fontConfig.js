/**
 * @file fontConfig.js
 * @description Centralized font configuration for Quill editor
 * Phase 1: System fonts only (no external dependencies)
 */

/**
 * Define available system fonts organized by category
 * Each font has a key and a CSS font-family array with fallbacks
 */
export const AVAILABLE_FONTS = {
  // Sans Serif fonts - most common and readable
  'sans-serif': ['Arial', 'Helvetica', 'sans-serif'],
  'verdana': ['Verdana', 'sans-serif'],
  'trebuchet': ['Trebuchet MS', 'sans-serif'],
  'tahoma': ['Tahoma', 'sans-serif'],

  // Serif fonts - traditional, formal appearance
  'georgia': ['Georgia', 'serif'],
  'times': ['Times New Roman', 'serif'],
  'garamond': ['Garamond', 'serif'],
  'book': ['Book Antiqua', 'serif'],

  // Monospace fonts - code and technical content
  'courier': ['Courier New', 'monospace'],
  'consolas': ['Consolas', 'monospace'],
  'monaco': ['Monaco', 'monospace'],

  // Display/Decorative fonts
  'comic': ['Comic Sans MS', 'cursive'],
  'impact': ['Impact', 'sans-serif'],
};

/**
 * Font display names for dropdown labels
 * Maps font keys to human-readable labels
 */
export const FONT_LABELS = {
  'sans-serif': 'Arial',
  'verdana': 'Verdana',
  'trebuchet': 'Trebuchet MS',
  'tahoma': 'Tahoma',
  'georgia': 'Georgia',
  'times': 'Times New Roman',
  'garamond': 'Garamond',
  'book': 'Book Antiqua',
  'courier': 'Courier New',
  'consolas': 'Consolas',
  'monaco': 'Monaco',
  'comic': 'Comic Sans MS',
  'impact': 'Impact',
};

/**
 * Get all available font options for toolbar
 * @returns {string[]} Array of font keys
 */
export const getFontOptions = () => {
  return Object.keys(AVAILABLE_FONTS);
};

/**
 * Get CSS font-family value for a font key
 * @param {string} fontKey - Font key from AVAILABLE_FONTS
 * @returns {string} CSS font-family value with fallbacks
 */
export const getFontCSSFamily = (fontKey) => {
  const font = AVAILABLE_FONTS[fontKey];
  return font ? font.join(', ') : 'inherit';
};

/**
 * Get all fonts organized by category
 * Useful for rendering categorized dropdown
 */
export const getFontsByCategory = () => {
  return {
    'Sans Serif': ['sans-serif', 'verdana', 'trebuchet', 'tahoma'],
    'Serif': ['georgia', 'times', 'garamond', 'book'],
    'Monospace': ['courier', 'consolas', 'monaco'],
    'Display': ['comic', 'impact'],
  };
};

/**
 * Export configuration object for Quill
 */
export const quillFontConfig = {
  whitelist: getFontOptions(),
};
