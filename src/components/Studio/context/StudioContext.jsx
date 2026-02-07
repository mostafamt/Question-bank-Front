/**
 * @file StudioContext.jsx
 * @description Context provider for Studio component state management
 * Centralizes all Studio state and eliminates prop drilling
 */

import React, { createContext, useContext, useRef, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useStore } from "../../../store/store";
import { useAppMode } from "../../../utils/tabFiltering";
import { parseVirtualBlocksFromPages } from "../../../utils/virtual-blocks";

// Import all hooks
import usePageNavigation from "../hooks/usePageNavigation";
import useAreaManagement from "../hooks/useAreaManagement";
import useCompositeBlocks from "../hooks/useCompositeBlocks";
import useVirtualBlocks from "../hooks/useVirtualBlocks";
import useStudioActions from "../hooks/useStudioActions";
import useTabState from "../hooks/useTabState";
import useLayoutState from "../hooks/useLayoutState";
import useOCRSettings from "../hooks/useOCRSettings";
import useSubObjectState from "../hooks/useSubObjectState";

// Import constants
import { LANGUAGE_CODES } from "../constants";

const StudioContext = createContext(null);

/**
 * Studio Context Provider
 * Wraps Studio component and provides centralized state management
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.studioProps - Props passed to Studio component
 */
export const StudioProvider = ({ children, studioProps }) => {
  const {
    pages,
    types,
    subObject = false,
    handleClose,
    handleSubmit,
    language: langProp,
    typeOfActiveType: tOfActiveType,
    onSubmitAutoGenerate,
    loadingAutoGenerate,
    refetch,
    compositeBlocksTypes,
    updateAreaProperty: parentUpdateAreaProperty,
    type,
  } = studioProps;

  // Router hooks
  const { bookId, chapterId } = useParams();
  const location = useLocation();

  // Mode detection
  const mode = useAppMode();
  const isReaderMode = mode === "reader";

  // Global store
  const { openModal, setFormState } = useStore();

  // ============ REFS ============
  const studioEditorRef = useRef(null);
  const canvasRef = useRef(null);
  const thumbnailsRef = useRef(null);

  // ============ VIRTUAL BLOCKS STATE ============
  // Initialize virtual blocks from pages (needs to be before useVirtualBlocks)
  const [virtualBlocks, setVirtualBlocks] = React.useState(() =>
    subObject ? [] : parseVirtualBlocksFromPages(pages)
  );

  // ============ PAGE NAVIGATION ============
  const pageNavigation = usePageNavigation({
    pages,
    subObject,
  });

  const { activePageIndex, activePageId, changePageByIndex, changePageById } =
    pageNavigation;

  // ============ AREA MANAGEMENT ============
  const areaManagement = useAreaManagement({
    pages,
    activePageIndex,
    types,
    studioEditorRef,
    subObject,
    type,
    handleSubmit,
    updateAreaPropertyForParent: parentUpdateAreaProperty,
    activePageId,
    virtualBlocks,
    refetch,
  });

  const {
    areas,
    setAreas,
    areasProperties,
    setAreasProperties,
    getBlockFromBlockId,
    recalculateAreas,
    updateAreaProperty,
    onClickDeleteArea,
    updateAreaPropertyById,
    onEditText,
    syncAreasProperties,
    onChangeArea,
    onClickSubmit,
  } = areaManagement;

  // ============ VIRTUAL BLOCKS ============
  const virtualBlocksManagement = useVirtualBlocks({
    virtualBlocks,
    setVirtualBlocks,
    pages,
    subObject,
    recalculateAreas,
  });

  // ============ COMPOSITE BLOCKS ============
  const compositeBlocksManagement = useCompositeBlocks({
    canvasRef,
    studioEditorRef,
    language: virtualBlocksManagement.language,
    chapterId,
    openModal,
    pages,
    areasProperties,
  });

  // ============ STUDIO ACTIONS ============
  const studioActions = useStudioActions({
    getBlockFromBlockId,
  });

  // ============ LAYOUT STATE ============
  const layoutState = useLayoutState({
    studioEditorRef,
    recalculateAreas,
    activePageIndex,
    setAreas,
  });

  // ============ OCR SETTINGS ============
  const ocrSettings = useOCRSettings({
    initialLanguage: langProp || LANGUAGE_CODES.ENGLISH,
    canvasRef,
    imageRef: studioEditorRef?.current?.studioEditorSelectorRef,
  });

  // ============ SUB-OBJECT STATE ============
  const subObjectState = useSubObjectState({
    initialType: "",
    initialTypeOfActiveType: tOfActiveType || "",
  });

  // ============ TAB STATE ============
  // Tab state initialized empty - will be updated when columns are built
  const tabState = useTabState([], []);

  // ============ CONTEXT VALUE ============
  const contextValue = useMemo(
    () => ({
      // Original Props
      pages,
      types,
      subObject,
      type,
      handleClose,
      handleSubmit,
      onSubmitAutoGenerate,
      loadingAutoGenerate,
      refetch,
      compositeBlocksTypes,
      parentUpdateAreaProperty,
      tOfActiveType,

      // Router
      bookId,
      chapterId,
      location,

      // Mode
      mode,
      isReaderMode,

      // Store
      openModal,
      setFormState,

      // Refs
      studioEditorRef,
      canvasRef,
      thumbnailsRef,

      // Virtual Blocks State (raw)
      virtualBlocks,
      setVirtualBlocks,

      // Page Navigation
      ...pageNavigation,

      // Area Management
      ...areaManagement,

      // Virtual Blocks Management
      virtualBlocksManagement,
      showVB: virtualBlocksManagement.showVB,
      setShowVB: virtualBlocksManagement.setShowVB,
      toggleVirtualBlocks: virtualBlocksManagement.toggleVirtualBlocks,
      onClickToggleVirutalBlocks:
        virtualBlocksManagement.onClickToggleVirutalBlocks,

      // Composite Blocks
      compositeBlocksManagement,
      compositeBlocks: compositeBlocksManagement.compositeBlocks,
      setCompositeBlocks: compositeBlocksManagement.setCompositeBlocks,
      loadingSubmitCompositeBlocks:
        compositeBlocksManagement.loadingSubmitCompositeBlocks,
      onChangeCompositeBlocks:
        compositeBlocksManagement.onChangeCompositeBlocks,
      DeleteCompositeBlocks: compositeBlocksManagement.DeleteCompositeBlocks,
      processCompositeBlock: compositeBlocksManagement.processCompositeBlock,
      onSubmitCompositeBlocks:
        compositeBlocksManagement.onSubmitCompositeBlocks,
      onChangeCompositeBlockArea:
        compositeBlocksManagement.onChangeCompositeBlockArea,
      onClickHand: compositeBlocksManagement.onClickHand,

      // Studio Actions
      studioActions,
      highlight: studioActions.highlight,
      setHighlight: studioActions.setHighlight,
      highlightedBlockId: studioActions.highlightedBlockId,
      highlightBlock: studioActions.highlightBlock,
      hightBlock: studioActions.hightBlock, // Deprecated alias

      // Layout State
      layoutState,
      imageScaleFactor: layoutState.imageScaleFactor,
      setImageScaleFactor: layoutState.setImageScaleFactor,
      showStickyToolbar: layoutState.showStickyToolbar,
      colorIndex: layoutState.colorIndex,
      setColorIndex: layoutState.setColorIndex,
      incrementColorIndex: layoutState.incrementColorIndex,

      // OCR Settings
      ocrSettings,
      language: ocrSettings.language,
      setLanguage: ocrSettings.setLanguage,
      languageCode: ocrSettings.languageCode,
      isRTL: ocrSettings.isRTL,
      performOCR: ocrSettings.performOCR,

      // Sub-Object State
      subObjectState,
      activeType: subObjectState.activeType,
      setActiveType: subObjectState.setActiveType,
      typeOfActiveType: subObjectState.typeOfActiveType,
      setTypeOfActiveType: subObjectState.setTypeOfActiveType,
      isEditingSubObject: subObjectState.isEditingSubObject,

      // Tab State
      tabState,
      activeLeftTab: tabState.activeLeftTab,
      setActiveLeftTab: tabState.setActiveLeftTab,
      activeRightTab: tabState.activeRightTab,
      setActiveRightTab: tabState.setActiveRightTab,
      isBlockAuthoringActive: tabState.isBlockAuthoringActive,
      isCompositeBlocksActive: tabState.isCompositeBlocksActive,
    }),
    [
      // Dependencies - only include stable references or primitives
      pages,
      types,
      subObject,
      type,
      bookId,
      chapterId,
      mode,
      isReaderMode,
      virtualBlocks,
      pageNavigation,
      areaManagement,
      virtualBlocksManagement,
      compositeBlocksManagement,
      studioActions,
      layoutState,
      ocrSettings,
      subObjectState,
      tabState,
      openModal,
      setFormState,
    ]
  );

  return (
    <StudioContext.Provider value={contextValue}>
      {children}
    </StudioContext.Provider>
  );
};

/**
 * Hook to access Studio context
 * @returns {Object} Studio context value
 * @throws {Error} If used outside of StudioProvider
 */
export const useStudioContext = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudioContext must be used within StudioProvider");
  }
  return context;
};

export default StudioContext;
