/**
 * @file Studio.jsx
 * @description Main Studio component for content authoring
 * Refactored to use custom hooks and services for better maintainability
 */

import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { Alert } from "@mui/material";
import { parseVirtualBlocksFromPages } from "../../utils/virtual-blocks";
import { useAppMode } from "../../utils/tabFiltering";
import {
  buildLeftColumns,
  buildRightColumns,
  buildReaderLeftColumns,
  buildReaderRightColumns,
} from "./columns";

import { RIGHT_TAB_NAMES, DEFAULTS, LANGUAGE_CODES } from "./constants";
import { ENGLISH, ARABIC } from "../../utils/ocr";

import StudioEditor from "./StudioEditor/StudioEditor";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";
import StudioStickyToolbar from "./StudioStickyToolbar/StudioStickyToolbar";
import BookColumn from "../Book/BookColumn/BookColumn";
import { useStore } from "../../store/store";

import styles from "./studio.module.scss";

// Import hooks
import usePageNavigation from "./hooks/usePageNavigation";
import useAreaManagement from "./hooks/useAreaManagement";
import useCompositeBlocks from "./hooks/useCompositeBlocks";
import useStudioActions from "./hooks/useStudioActions";
import useVirtualBlocks from "./hooks/useVirtualBlocks";
import useLabelManagement from "./hooks/useLabelManagement";
import usePlayBlock from "./hooks/usePlayBlock";

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

  // ============ ROUTER ============
  const { chapterId } = useParams();
  const location = useLocation();

  // ============ MODE DETECTION ============
  const mode = useAppMode();
  const isReaderMode = mode === "reader";

  // ============ GLOBAL STORE ============
  const { openModal, setFormState } = useStore();

  // ============ LANGUAGE STATE ============
  const [language, setLanguage] = React.useState(
    langProp === LANGUAGE_CODES.ENGLISH ? ENGLISH : ARABIC
  );

  // ============ VIRTUAL BLOCKS STATE ============
  const [virtualBlocks, setVirtualBlocks] = React.useState(() =>
    subObject ? [] : parseVirtualBlocksFromPages(pages)
  );

  // ============ LAYOUT STATE ============
  const [showStickyToolbar, setShowStickyToolbar] = React.useState(false);
  const [imageScaleFactor, setImageScaleFactor] = React.useState(
    DEFAULTS.IMAGE_SCALE_FACTOR
  );
  const [loadingSubmit] = React.useState(false);

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

  // ============ PLAY BLOCK (Reader Mode) ============
  const { onPlayBlock } = usePlayBlock({ openModal, setFormState });

  // ============ TAB STATE ============
  // Build columns first, then initialize tab state
  const LEFT_COLUMNS = React.useMemo(
    () =>
      isReaderMode
        ? buildReaderLeftColumns({
            pages,
            activePage: pages?.[activePageIndex],
            setActivePage: (page) => {
              const idx = pages.findIndex((p) => p._id === page._id);
              if (idx !== -1) changePageByIndex(idx);
            },
            onChangeActivePage: (page) => {
              const idx = pages.findIndex((p) => p._id === page._id);
              if (idx !== -1) changePageByIndex(idx);
            },
            changePageById,
            navigateToBlock: (pageId, blockId) => {
              changePageById(pageId);
              hightBlock(blockId);
            },
            chapterId,
            thumbnailsRef,
          })
        : buildLeftColumns({
            pages,
            chapterId,
            activePageIndex,
            changePageByIndex,
            thumbnailsRef,
            changePageById,
            getBlockFromBlockId,
            hightBlock,
          }),
    [
      isReaderMode,
      pages,
      activePageIndex,
      chapterId,
      changePageByIndex,
      changePageById,
      getBlockFromBlockId,
      hightBlock,
    ]
  );

  const RIGHT_COLUMNS = React.useMemo(
    () =>
      isReaderMode
        ? buildReaderRightColumns({
            pages,
            setActivePage: (page) => {
              const idx = pages.findIndex((p) => p._id === page._id);
              if (idx !== -1) changePageByIndex(idx);
            },
            onChangeActivePage: (page) => {
              const idx = pages.findIndex((p) => p._id === page._id);
              if (idx !== -1) changePageByIndex(idx);
            },
            changePageById,
            navigateToBlock: (pageId, blockId) => {
              changePageById(pageId);
              hightBlock(blockId);
            },
            chapterId,
          })
        : buildRightColumns({
            areasProperties,
            setAreasProperties,
            activePageIndex,
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
            chapterId,
            pages,
            setActivePageIndex,
            changePageById,
            getBlockFromBlockId,
            hightBlock,
            changePageByIndex,
            onClickHand,
          }),
    [
      isReaderMode,
      pages,
      areasProperties,
      activePageIndex,
      type,
      types,
      subObject,
      tOfActiveType,
      loadingSubmit,
      showVB,
      compositeBlocks,
      compositeBlocksTypes,
      loadingSubmitCompositeBlocks,
      highlight,
      chapterId,
      onSubmitAutoGenerate,
      loadingAutoGenerate,
    ]
  );

  const [activeLeftTab, setActiveLeftTab] = React.useState(LEFT_COLUMNS[0]);
  const [activeRightTab, setActiveRightTab] = React.useState(RIGHT_COLUMNS[0]);

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
  React.useEffect(() => {
    if (!imageScaleFactor) return;

    // Reset _updated flag for active page
    setAreas((prev) => {
      const newAreas = [...prev];
      if (newAreas[activePageIndex]) {
        newAreas[activePageIndex] = newAreas[activePageIndex].map((area) => ({
          ...area,
          _updated: false,
        }));
      }
      return newAreas;
    });

    const timer = setTimeout(recalculateAreas, 10);
    return () => clearTimeout(timer);
  }, [imageScaleFactor, activePageIndex, setAreas, recalculateAreas]);

  // ============ HANDLERS ============

  /** Route area changes based on active tab */
  const onChangeHandler = React.useCallback(
    (areasParam) => {
      if (activeRightTab?.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS.label) {
        onChangeCompositeBlockArea(areasParam);
      } else {
        onChangeArea(areasParam);
      }
    },
    [activeRightTab, onChangeCompositeBlockArea, onChangeArea]
  );

  /** Update virtual blocks for current page */
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

  return (
    <>
      <StudioStickyToolbar
        show={showStickyToolbar}
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        activePage={activePageIndex}
        areasProperties={areasProperties}
        showVB={showVB}
        onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
        onImageLoad={recalculateAreas}
        pages={pages}
        onClickImage={changePageByIndex}
      />

      <LanguageSwitcher language={language} setLanguage={setLanguage} />

      <div className={styles.studio}>
        <BookColumn
          COLUMNS={LEFT_COLUMNS}
          activeColumn={LEFT_COLUMNS[0]}
          onImageLoad={recalculateAreas}
          activeTab={activeLeftTab}
          setActiveTab={setActiveLeftTab}
        />

        <StudioEditor
          ref={studioEditorRef}
          areasProperties={areasProperties}
          setAreasProperties={setAreasProperties}
          activePage={activePageIndex}
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
          onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
          onClickImage={changePageByIndex}
          activeRightTab={activeRightTab}
          compositeBlocksTypes={compositeBlocksTypes}
          compositeBlocks={compositeBlocks}
          setCompositeBlocks={setCompositeBlocks}
          highlight={highlight}
          setHighlight={setHighlight}
          highlightedBlockId={highlightedBlockId}
          onPlayBlock={onPlayBlock}
        />

        <BookColumn
          COLUMNS={RIGHT_COLUMNS}
          activeColumn={RIGHT_COLUMNS[0]}
          onImageLoad={recalculateAreas}
          activeTab={activeRightTab}
          setActiveTab={setActiveRightTab}
        />
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
};

export default Studio;
