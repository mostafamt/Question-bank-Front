/**
 * @file StudioContext.jsx
 * @description Context provider for Studio component state
 */

import React, { createContext, useContext, useRef, useState } from "react";
import { usePageManagement } from "../hooks/usePageManagement";
import { useAreaManagement } from "../hooks/useAreaManagement";
import { useCoordinateConversion } from "../hooks/useCoordinateConversion";
import { useCompositeBlocks } from "../hooks/useCompositeBlocks";
import { useVirtualBlocks } from "../hooks/useVirtualBlocks";
import { DEFAULTS, LANGUAGE_CODES, OCR_LANGUAGES, LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../constants";

const StudioContext = createContext(null);

/**
 * Studio Context Provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.studioProps - Studio component props
 */
export const StudioProvider = ({ children, studioProps }) => {
  const {
    pages,
    types,
    subObject,
    language: lang,
    chapterId,
    // Extract parent callbacks (used when Studio is a sub-object modal)
    updateAreaProperty: parentUpdateAreaProperty,
    handleClose,
    ...restProps
  } = studioProps;

  // Refs
  const studioEditorRef = useRef(null);
  const canvasRef = useRef(null);
  const thumbnailsRef = useRef(null);

  // Image scale state
  const [imageScaleFactor, setImageScaleFactor] = useState(
    DEFAULTS.IMAGE_SCALE_FACTOR
  );

  // Language state
  const [language, setLanguage] = useState(
    lang === LANGUAGE_CODES.ENGLISH
      ? OCR_LANGUAGES.ENGLISH
      : OCR_LANGUAGES.ARABIC
  );

  // Loading states
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Sub-object state
  const [activeType, setActiveType] = useState("");
  const [typeOfActiveType, setTypeOfActiveType] = useState("");

  // Tab state - Initialize with label objects to prevent null errors
  const [activeLeftTab, setActiveLeftTab] = useState({
    id: 'initial',
    label: LEFT_TAB_NAMES.THUMBNAILS,
    component: null,
  });
  const [activeRightTab, setActiveRightTab] = useState({
    id: 'initial',
    label: RIGHT_TAB_NAMES.BLOCK_AUTHORING,
    component: null,
  });

  // Page management
  const pageManagement = usePageManagement(pages, subObject);

  // Area management
  const areaManagement = useAreaManagement(
    pages,
    pageManagement.activePageIndex,
    types
  );

  // Get imageRef from studioEditorRef when available
  const imageRef = studioEditorRef.current?.studioEditorSelectorRef;

  // Coordinate conversion
  const coordinateConversion = useCoordinateConversion(
    areaManagement,
    imageRef,
    pageManagement.activePageIndex,
    imageScaleFactor
  );

  // Composite blocks
  const compositeBlocksManagement = useCompositeBlocks(
    imageRef,
    canvasRef,
    chapterId,
    language
  );

  // Virtual blocks
  const virtualBlocksManagement = useVirtualBlocks(
    pages,
    subObject,
    pageManagement.activePageIndex,
    coordinateConversion.convertPercentageToPx
  );

  // Context value
  const value = {
    // Props
    pages,
    types,
    subObject,
    chapterId,
    ...restProps,

    // Parent callbacks (when Studio is used as sub-object modal)
    // Note: parentUpdateAreaProperty is the parent Studio's updateAreaProperty
    // Different from areaManagement.updateAreaProperty which updates local state
    parentUpdateAreaProperty,
    handleClose,

    // Refs
    studioEditorRef,
    canvasRef,
    thumbnailsRef,

    // State
    imageScaleFactor,
    setImageScaleFactor,
    language,
    setLanguage,
    loadingSubmit,
    setLoadingSubmit,
    activeType,
    setActiveType,
    typeOfActiveType,
    setTypeOfActiveType,
    activeLeftTab,
    setActiveLeftTab,
    activeRightTab,
    setActiveRightTab,

    // Page Management
    ...pageManagement,

    // Area Management
    ...areaManagement,

    // Coordinate Conversion
    ...coordinateConversion,

    // Composite Blocks
    ...compositeBlocksManagement,

    // Virtual Blocks
    ...virtualBlocksManagement,
  };

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
};

/**
 * Hook to use Studio context
 * @returns {Object} - Studio context value
 */
export const useStudioContext = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudioContext must be used within StudioProvider");
  }
  return context;
};
