/**
 * @file Studio.jsx
 * @description Main Studio component for content authoring
 * Refactored to use custom hooks, services, and sub-components
 */

import React from "react";
import { useParams } from "react-router-dom";
import { Alert } from "@mui/material";
import { parseVirtualBlocksFromPages } from "../../utils/virtual-blocks";
import { useAppMode } from "../../utils/tabFiltering";
import { ENGLISH, ARABIC } from "../../utils/ocr";
import { useStore } from "../../store/store";

import { RIGHT_TAB_NAMES, DEFAULTS, LANGUAGE_CODES } from "./constants";
import { StudioHeader, StudioLayout } from "./components";

// Import hooks
import usePageNavigation from "./hooks/usePageNavigation";
import useAreaManagement from "./hooks/useAreaManagement";
import useCompositeBlocks from "./hooks/useCompositeBlocks";
import useStudioActions from "./hooks/useStudioActions";
import useVirtualBlocks from "./hooks/useVirtualBlocks";
import useLabelManagement from "./hooks/useLabelManagement";
import usePlayBlock from "./hooks/usePlayBlock";
import useStudioColumns from "./hooks/useStudioColumns";

/**
 * Studio Component - Content authoring tool for book pages
 * @param {Object} props - Component props
 */
const Studio = (props) => {
  const {
    pages,
    type,
    subObject,
    types,
    handleSubmit,
    language: langProp,
    typeOfActiveType: tOfActiveType,
    onSubmitAutoGenerate,
    loadingAutoGenerate,
    refetch,
    compositeBlocksTypes,
  } = props;

  // ============ REFS ============
  const studioEditorRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const thumbnailsRef = React.useRef(null);
  const recalculateAreasRef = React.useRef(null);

  // ============ ROUTER & MODE ============
  const { chapterId } = useParams();
  const mode = useAppMode();
  const isReaderMode = mode === "reader";

  // ============ GLOBAL STORE ============
  const { openModal, setFormState } = useStore();

  // ============ LOCAL STATE ============
  const [language, setLanguage] = React.useState(
    langProp === LANGUAGE_CODES.ENGLISH ? ENGLISH : ARABIC
  );
  const [virtualBlocks, setVirtualBlocks] = React.useState(() =>
    subObject ? [] : parseVirtualBlocksFromPages(pages)
  );
  const [showStickyToolbar, setShowStickyToolbar] = React.useState(false);
  const [imageScaleFactor, setImageScaleFactor] = React.useState(
    DEFAULTS.IMAGE_SCALE_FACTOR
  );

  // ============ PAGE NAVIGATION ============
  const {
    activePageIndex,
    setActivePageIndex,
    activePageId,
    changePageByIndex,
    changePageById,
  } = usePageNavigation({ pages, subObject });

  // ============ AREA MANAGEMENT ============
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
    loadingSubmit,
  } = useAreaManagement({
    pages,
    activePageIndex,
    types,
    studioEditorRef,
    subObject,
    type,
    handleSubmit,
    updateAreaPropertyForParent: props.updateAreaProperty,
    activePageId,
    virtualBlocks,
    refetch,
  });

  // Keep recalculateAreas ref updated (to avoid dependency in useEffect)
  React.useEffect(() => {
    recalculateAreasRef.current = recalculateAreas;
  }, [recalculateAreas]);

  // ============ VIRTUAL BLOCKS ============
  const { showVB, onClickToggleVirutalBlocks } = useVirtualBlocks({
    virtualBlocks,
    setVirtualBlocks,
    pages,
    subObject,
    recalculateAreas,
  });

  // ============ COMPOSITE BLOCKS ============
  const {
    compositeBlocks,
    setCompositeBlocks,
    loadingSubmitCompositeBlocks,
    onChangeCompositeBlocks,
    DeleteCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    onChangeCompositeBlockArea,
    onClickHand,
  } = useCompositeBlocks({
    canvasRef,
    studioEditorRef,
    language,
    chapterId,
    openModal,
    pages,
    areasProperties,
    compositeBlocksTypes,
  });

  // ============ STUDIO ACTIONS ============
  const { highlight, setHighlight, highlightedBlockId, hightBlock } =
    useStudioActions({ getBlockFromBlockId });

  // ============ LABEL MANAGEMENT ============
  const { onChangeLabel } = useLabelManagement({
    areasProperties,
    areas,
    activePageIndex,
    types,
    subObject,
    tOfActiveType,
    canvasRef,
    studioEditorRef,
    language,
    syncAreasProperties,
    updateAreaProperty,
    openModal,
  });

  // ============ PLAY BLOCK ============
  const { onPlayBlock } = usePlayBlock({ openModal, setFormState });

  // ============ COLUMNS ============

  // Memoize rightColumnProps to prevent new object reference every render
  const rightColumnProps = React.useMemo(
    () => ({
      areasProperties,
      setAreasProperties,
      onEditText,
      onClickDeleteArea,
      type,
      onClickSubmit,
      loadingSubmit,
      updateAreaProperty,
      updateAreaPropertyById,
      types,
      onChangeLabel,
      subObject,
      tOfActiveType,
      onSubmitAutoGenerate,
      loadingAutoGenerate,
      onClickToggleVirutalBlocks,
      showVB,
      compositeBlocks,
      compositeBlocksTypes,
      onChangeCompositeBlocks,
      processCompositeBlock,
      onSubmitCompositeBlocks,
      loadingSubmitCompositeBlocks,
      DeleteCompositeBlocks,
      highlight,
      setHighlight,
      setActivePageIndex,
      onClickHand,
    }),
    [
      areasProperties,
      setAreasProperties,
      onEditText,
      onClickDeleteArea,
      type,
      onClickSubmit,
      loadingSubmit,
      updateAreaProperty,
      updateAreaPropertyById,
      types,
      onChangeLabel,
      subObject,
      tOfActiveType,
      onSubmitAutoGenerate,
      loadingAutoGenerate,
      onClickToggleVirutalBlocks,
      showVB,
      compositeBlocks,
      compositeBlocksTypes,
      onChangeCompositeBlocks,
      processCompositeBlock,
      onSubmitCompositeBlocks,
      loadingSubmitCompositeBlocks,
      DeleteCompositeBlocks,
      highlight,
      setHighlight,
      setActivePageIndex,
      onClickHand,
    ]
  );

  const {
    leftColumns,
    rightColumns,
    activeLeftTab,
    setActiveLeftTab,
    activeRightTab,
    setActiveRightTab,
  } = useStudioColumns({
    isReaderMode,
    pages,
    activePageIndex,
    chapterId,
    thumbnailsRef,
    changePageByIndex,
    changePageById,
    getBlockFromBlockId,
    hightBlock,
    rightColumnProps,
  });

  // ============ EFFECTS ============

  // Sticky toolbar observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyToolbar(!entry.isIntersecting),
      { root: null, threshold: 0 }
    );

    const imageActionsRef = studioEditorRef.current?.imageActionsRef;
    if (imageActionsRef?.current) {
      observer.observe(imageActionsRef.current);
    }

    return () => {
      if (imageActionsRef?.current) {
        observer.unobserve(imageActionsRef.current);
      }
    };
  }, []);

  // Recalculate areas on zoom change
  // Fixed: Guard setAreas to only update when needed, use ref for recalculateAreas
  React.useEffect(() => {
    if (!imageScaleFactor) return;

    setAreas((prev) => {
      const currentPageAreas = prev[activePageIndex];
      if (!currentPageAreas) return prev;

      // Check if any area actually needs the _updated flag reset
      const needsUpdate = currentPageAreas.some(
        (area) => area._updated !== false
      );
      if (!needsUpdate) return prev; // Same reference = no re-render

      // Only create new array when actually needed
      const newAreas = [...prev];
      newAreas[activePageIndex] = currentPageAreas.map((area) => ({
        ...area,
        _updated: false,
      }));
      return newAreas;
    });

    // Use ref to avoid unstable dependency
    const timer = setTimeout(() => recalculateAreasRef.current?.(), 10);
    return () => clearTimeout(timer);
  }, [imageScaleFactor, activePageIndex, setAreas]);

  // ============ HANDLERS ============

  const onChangeHandler = React.useCallback(
    (areasParam) => {
      if (activeRightTab?.id === "composite-blocks") {
        onChangeCompositeBlockArea(areasParam);
      } else {
        onChangeArea(areasParam);
      }
    },
    [activeRightTab, onChangeCompositeBlockArea, onChangeArea]
  );

  const handleSetVirtualBlocks = React.useCallback(
    (value) => {
      setVirtualBlocks((prev) => {
        const newBlocks = [...prev];
        newBlocks[activePageIndex] = value;
        return newBlocks;
      });
    },
    [activePageIndex]
  );

  // ============ RENDER ============

  if (!pages?.length) {
    return <Alert severity="error">No pages available.</Alert>;
  }

  console.log('compositeBlocks= ', compositeBlocks);

  return (
    <>
      <StudioHeader
        showStickyToolbar={showStickyToolbar}
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        activePageIndex={activePageIndex}
        areasProperties={areasProperties}
        showVB={showVB}
        onClickToggleVirtualBlocks={onClickToggleVirutalBlocks}
        onImageLoad={recalculateAreas}
        pages={pages}
        onClickImage={changePageByIndex}
        language={language}
        setLanguage={setLanguage}
      />

      <StudioLayout
        ref={studioEditorRef}
        leftColumns={leftColumns}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
        rightColumns={rightColumns}
        activeRightTab={activeRightTab}
        setActiveRightTab={setActiveRightTab}
        areasProperties={areasProperties}
        setAreasProperties={setAreasProperties}
        activePageIndex={activePageIndex}
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        onChangeHandler={onChangeHandler}
        pages={pages}
        onImageLoad={recalculateAreas}
        virtualBlocks={virtualBlocks[activePageIndex]}
        setVirtualBlocks={handleSetVirtualBlocks}
        showVB={showVB}
        onClickToggleVirtualBlocks={onClickToggleVirutalBlocks}
        onClickImage={changePageByIndex}
        compositeBlocksTypes={compositeBlocksTypes}
        compositeBlocks={compositeBlocks}
        setCompositeBlocks={setCompositeBlocks}
        highlight={highlight}
        setHighlight={setHighlight}
        highlightedBlockId={highlightedBlockId}
        onPlayBlock={onPlayBlock}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
};

export default Studio;
