/**
 * @file usePlayBlock.js
 * @description Hook for handling block playback in reader mode
 * Manages opening the appropriate modal based on block type
 */

import React from "react";
import { STUDIO_MODALS, determineModalForArea } from "../services/modal.service";

/**
 * Hook for handling block playback
 * @param {Object} params - Hook parameters
 * @param {Function} params.openModal - Function to open modals
 * @param {Function} params.setFormState - Function to set form state in store
 * @returns {Object} Play block handlers
 */
const usePlayBlock = ({ openModal, setFormState }) => {
  /**
   * Handle playing a block - opens appropriate modal based on type
   * @param {Object} area - Area coordinates
   * @param {Object} areaProps - Area properties
   */
  const onPlayBlock = React.useCallback(
    (area, areaProps) => {
      if (!areaProps) return;

      const { modalName, isComplex } = determineModalForArea(areaProps);

      if (isComplex) {
        // Set the activeId in the store for PlayObjectModal2
        setFormState({ activeId: areaProps.text });
        openModal(STUDIO_MODALS.PLAY_OBJECT);
      } else {
        // Handle text and image types in quill modal
        openModal(STUDIO_MODALS.QUILL, {
          workingArea: {
            blockId: areaProps.blockId,
            contentType: areaProps.type,
            text: areaProps.text,
            typeOfLabel: areaProps.typeOfLabel,
            image: areaProps.image,
          },
          updateAreaPropertyById: () => {}, // Read-only in reader mode
        });
      }
    },
    [openModal, setFormState]
  );

  /**
   * Check if a block is playable (has content)
   * @param {Object} areaProps - Area properties
   * @returns {boolean} True if block can be played
   */
  const isBlockPlayable = React.useCallback((areaProps) => {
    if (!areaProps) return false;
    return Boolean(areaProps.text || areaProps.image || areaProps.blockId);
  }, []);

  /**
   * Get play button label based on block type
   * @param {Object} areaProps - Area properties
   * @returns {string} Button label
   */
  const getPlayLabel = React.useCallback((areaProps) => {
    if (!areaProps) return "View";

    const { isComplex } = determineModalForArea(areaProps);
    return isComplex ? "Play" : "View";
  }, []);

  return {
    onPlayBlock,
    isBlockPlayable,
    getPlayLabel,
  };
};

export default usePlayBlock;
