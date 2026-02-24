/**
 * @file useStudioColumns.js
 * @description Hook for building Studio left and right column configurations
 * Centralizes the complex column building logic from Studio.jsx
 */

import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  buildLeftColumns,
  buildRightColumns,
  buildReaderLeftColumns,
  buildReaderRightColumns,
} from "../columns";

/**
 * Hook for building and managing Studio columns
 * @param {Object} params - Hook parameters
 * @param {boolean} params.isReaderMode - Whether in reader mode
 * @param {Object[]} params.pages - Pages array
 * @param {number} params.activePageIndex - Active page index
 * @param {string} params.chapterId - Chapter ID
 * @param {React.RefObject} params.thumbnailsRef - Thumbnails reference
 * @param {Function} params.changePageByIndex - Change page by index
 * @param {Function} params.changePageById - Change page by ID
 * @param {Function} params.getBlockFromBlockId - Get block by ID
 * @param {Function} params.hightBlock - Highlight block
 * @param {Object} params.rightColumnProps - Props for right column (studio mode)
 * @returns {Object} Column configurations and tab state
 */
const useStudioColumns = ({
  isReaderMode,
  pages,
  activePageIndex,
  chapterId,
  thumbnailsRef,
  changePageByIndex,
  changePageById,
  getBlockFromBlockId,
  hightBlock,
  rightColumnProps = {},
}) => {
  // Store callback functions in refs to avoid dependency changes
  const changePageByIdRef = useRef(changePageById);
  const hightBlockRef = useRef(hightBlock);
  const changePageByIndexRef = useRef(changePageByIndex);
  const getBlockFromBlockIdRef = useRef(getBlockFromBlockId);
  const pagesRef = useRef(pages);

  // Update refs only when values actually change (with proper dependency arrays)
  useEffect(() => {
    changePageByIdRef.current = changePageById;
  }, [changePageById]);

  useEffect(() => {
    hightBlockRef.current = hightBlock;
  }, [hightBlock]);

  useEffect(() => {
    changePageByIndexRef.current = changePageByIndex;
  }, [changePageByIndex]);

  useEffect(() => {
    getBlockFromBlockIdRef.current = getBlockFromBlockId;
  }, [getBlockFromBlockId]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  /**
   * Navigate to a specific block - stable reference using refs
   */
  const navigateToBlock = useCallback((pageId, blockId) => {
    changePageByIdRef.current(pageId);
    hightBlockRef.current(blockId);
  }, []);

  /**
   * Set active page from page object - stable reference using refs
   */
  const setActivePage = useCallback((page) => {
    const idx = pagesRef.current.findIndex((p) => p._id === page._id);
    if (idx !== -1) changePageByIndexRef.current(idx);
  }, []);

  /**
   * Build left columns based on mode
   * Uses stable callback references to minimize recalculations
   */
  const leftColumns = useMemo(() => {
    if (isReaderMode) {
      return buildReaderLeftColumns({
        pages,
        activePage: pages?.[activePageIndex],
        setActivePage,
        onChangeActivePage: setActivePage,
        changePageById: changePageByIdRef.current,
        navigateToBlock,
        chapterId,
        thumbnailsRef,
      });
    }

    return buildLeftColumns({
      pages,
      chapterId,
      activePageIndex,
      changePageByIndex: changePageByIndexRef.current,
      thumbnailsRef,
      changePageById: changePageByIdRef.current,
      getBlockFromBlockId: getBlockFromBlockIdRef.current,
      hightBlock: hightBlockRef.current,
    });
  }, [
    isReaderMode,
    pages,
    activePageIndex,
    chapterId,
    thumbnailsRef,
    setActivePage,
    navigateToBlock,
  ]);

  // Store rightColumnProps in ref for stable access
  const rightColumnPropsRef = useRef(rightColumnProps);
  useEffect(() => {
    rightColumnPropsRef.current = rightColumnProps;
  }, [rightColumnProps]);

  /**
   * Build right columns based on mode
   * Uses refs for stable access - removes rightColumnProps from dependencies
   */
  const rightColumns = useMemo(() => {
    if (isReaderMode) {
      return buildReaderRightColumns({
        pages,
        setActivePage,
        onChangeActivePage: setActivePage,
        changePageById: changePageByIdRef.current,
        navigateToBlock,
        chapterId,
      });
    }

    // Read from ref for stable access to most props
    const props = rightColumnPropsRef.current;

    // Destructure right column props for studio mode (stable props from ref)
    // These props are stable and don't change with activePageIndex
    const {
      setAreasProperties,
      type,
      types,
      subObject,
      tOfActiveType,
      onSubmitAutoGenerate,
      compositeBlocksTypes,
      onChangeCompositeBlocks,
      processCompositeBlock,
      onSubmitCompositeBlocks,
      DeleteCompositeBlocks,
      setHighlight,
      setActivePageIndex,
    } = props;

    // Get frequently changing props directly from rightColumnProps (not ref) to ensure fresh values
    // These props either:
    // 1. Use activePageIndex in their closures (callbacks)
    // 2. Are state values that change frequently
    const {
      areasProperties,
      compositeBlocks,
      loadingSubmitCompositeBlocks,
      onClickDeleteArea,
      loadingSubmit,
      // Callbacks that use activePageIndex in closures
      updateAreaProperty,
      updateAreaPropertyById,
      onEditText,
      onClickSubmit,
      onChangeLabel,
      onClickToggleVirutalBlocks,
      onClickHand,
      // State values that change
      showVB,
      highlight,
      loadingAutoGenerate,
    } = rightColumnProps;

    return buildRightColumns({
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
      changePageById: changePageByIdRef.current,
      getBlockFromBlockId: getBlockFromBlockIdRef.current,
      hightBlock: hightBlockRef.current,
      changePageByIndex: changePageByIndexRef.current,
      onClickHand,
    });
  }, [
    isReaderMode,
    pages,
    activePageIndex,
    chapterId,
    setActivePage,
    navigateToBlock,
    // Track props that change frequently to ensure fresh values
    // Data/state props
    rightColumnProps.areasProperties,
    rightColumnProps.compositeBlocks,
    rightColumnProps.loadingSubmitCompositeBlocks,
    rightColumnProps.loadingSubmit,
    rightColumnProps.showVB,
    rightColumnProps.highlight,
    rightColumnProps.loadingAutoGenerate,
    // Callbacks that use activePageIndex in closures
    rightColumnProps.onClickDeleteArea,
    rightColumnProps.updateAreaProperty,
    rightColumnProps.updateAreaPropertyById,
    rightColumnProps.onEditText,
    rightColumnProps.onClickSubmit,
    rightColumnProps.onChangeLabel,
    rightColumnProps.onClickToggleVirutalBlocks,
    rightColumnProps.onClickHand,
  ]);

  // Create stable strings of tab IDs to detect actual tab configuration changes
  // This prevents sync effects from running when only object references change
  const leftColumnsIds = useMemo(
    () => leftColumns.map((c) => c.id).join(","),
    [leftColumns]
  );

  const rightColumnsIds = useMemo(
    () => rightColumns.map((c) => c.id).join(","),
    [rightColumns]
  );

  // Tab state - use lazy initializer to avoid issues with computed values
  const [activeLeftTab, setActiveLeftTab] = useState(
    () => leftColumns[0] || null
  );
  const [activeRightTab, setActiveRightTab] = useState(
    () => rightColumns[0] || null
  );

  // Store active tab IDs in refs to avoid dependency issues
  const activeLeftTabIdRef = useRef(activeLeftTab?.id);
  const activeRightTabIdRef = useRef(activeRightTab?.id);

  // Update refs when tabs change (with proper dependencies)
  useEffect(() => {
    activeLeftTabIdRef.current = activeLeftTab?.id;
  }, [activeLeftTab]);

  useEffect(() => {
    activeRightTabIdRef.current = activeRightTab?.id;
  }, [activeRightTab]);

  // Sync left tab when columns change
  // Only runs when tabs are actually added/removed (not just reference changes)
  useEffect(() => {
    if (!leftColumns.length) return;

    // Respect collapsed state - don't reset if intentionally collapsed
    const currentId = activeLeftTabIdRef.current;
    if (currentId === "" || currentId === null || currentId === undefined) {
      return;
    }

    const next =
      leftColumns.find((col) => col.id === currentId) ||
      leftColumns[0];

    // Only update if the tab actually changed
    if (next.id !== currentId) {
      setActiveLeftTab(next);
    }
  }, [leftColumnsIds, leftColumns]);

  // Sync right tab when columns change
  // Only runs when tabs are actually added/removed (not just reference changes)
  useEffect(() => {
    if (!rightColumns.length) return;

    // Respect collapsed state - don't reset if intentionally collapsed
    const currentId = activeRightTabIdRef.current;
    if (currentId === "" || currentId === null || currentId === undefined) {
      return;
    }

    const next =
      rightColumns.find((col) => col.id === currentId) ||
      rightColumns[0];

    // Only update if the tab actually changed
    if (next.id !== currentId) {
      setActiveRightTab(next);
    }
  }, [rightColumnsIds, rightColumns]);

  return {
    // Columns
    leftColumns,
    rightColumns,

    // Tab state
    activeLeftTab,
    setActiveLeftTab,
    activeRightTab,
    setActiveRightTab,

    // Helpers
    navigateToBlock,
    setActivePage,
  };
};

export default useStudioColumns;
