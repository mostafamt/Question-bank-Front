/**
 * @fileoverview Styling service for Studio component area boxes
 * Handles color generation, highlighting, and visual state management for both
 * regular areas and composite block areas.
 *
 * This service was created as part of Phase 3 refactoring to centralize
 * Studio-specific styling logic and separate it from OCR utilities.
 *
 * @see docs/COMPOSITE_BLOCKS_STYLING_PLAN.md
 */

import {
  getStudioHighlightStyles,
  getDeletedBlockStyles,
} from "../../../config/highlighting";
import { hexToRgbA } from "../../../utils/helper";
import { DELETED } from "../../../utils/ocr";

/**
 * Generates dynamic CSS-in-JS styles for area boxes using Emotion syntax
 *
 * Creates distinct visual states for area boxes based on their properties:
 * - **Normal state**: Colored border with semi-transparent background
 * - **Highlighted state**: Thick black border with shadow effect and transition
 * - **Deleted state**: Dark border with semi-transparent black background
 *
 * The function works with both regular areas and composite block areas since
 * they share compatible data structures (id, color, status properties).
 *
 * @param {Array<AreaProperty|CompositeBlockArea>} areas - Array of area properties
 *   Each area should have: id, color, status (optional), and coordinate properties
 * @param {string} highlightedBlockId - UUID of the currently highlighted block
 *   When an area's id matches this, it receives prominent highlighting
 * @returns {Object} Emotion CSS-in-JS object for styling area boxes
 *   Returns an object with nested selectors targeting specific area divs
 *
 * @example
 * // For regular areas
 * const styles = constructBoxColors(areasProperties[activePage], highlightedBlockId);
 * <div css={styles}>...</div>
 *
 * @example
 * // For composite block areas
 * const styles = constructBoxColors(compositeBlocks.areas, highlightedBlockId);
 * <div css={styles}>...</div>
 *
 * @example
 * // Conditional usage based on active tab
 * css={
 *   constructBoxColors(
 *     activeRightTab.label === "Composite Blocks"
 *       ? compositeBlocks.areas
 *       : areasProperties[activePage],
 *     highlightedBlockId
 *   )
 * }
 */
export const constructBoxColors = (areas, highlightedBlockId) => {
  // Generate nth-child selectors for each area
  // Starts at index 2 to account for wrapper div structure
  const values = areas?.map((_, idx) => `& > div:nth-of-type(${idx + 2})`);

  // Fetch styling configurations from centralized config
  const highlightStyles = getStudioHighlightStyles();
  const deletedStyles = getDeletedBlockStyles();

  // Generate CSS object for each area based on its state
  const obj = areas?.map((area, idx) => {
    if (values[idx]) {
      // Case 1: Deleted area - Show dark styling
      if (area.status === DELETED) {
        return {
          [values[idx]]: {
            border: `${deletedStyles.border} !important`,
            backgroundColor: deletedStyles.backgroundColor,
          },
        };
      } else {
        // Case 2: Highlighted area - Show prominent styling with shadow
        if (area.id === highlightedBlockId) {
          return {
            [values[idx]]: {
              border: `${highlightStyles.border} !important`,
              backgroundColor: highlightStyles.backgroundColor,
              boxShadow: highlightStyles.boxShadow,
              transition: highlightStyles.transition,
            },
          };
        } else {
          // Case 3: Normal area - Show colored border and background
          return {
            [values[idx]]: {
              border: `2px solid ${area.color} !important`,
              backgroundColor: `${hexToRgbA(area.color)}`,
            },
          };
        }
      }
    } else {
      return {};
    }
  });

  // Return Emotion CSS object with nested selectors
  return { "& > div": obj };
};
