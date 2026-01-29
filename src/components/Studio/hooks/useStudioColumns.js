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

    // Destructure right column props for studio mode
    const {
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
    } = props;

    // Get compositeBlocks directly from rightColumnProps (not ref) to ensure fresh value
    const { compositeBlocks } = rightColumnProps;

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
    // Only track specific compositeBlocks changes to avoid over-rendering
    rightColumnProps.compositeBlocks,
  ]);

  // Tab state - use lazy initializer to avoid issues with computed values
  const [activeLeftTab, setActiveLeftTab] = useState(
    () => leftColumns[0] || null
  );
  const [activeRightTab, setActiveRightTab] = useState(
    () => rightColumns[0] || null
  );

  // Store active tab labels in refs to avoid dependency issues
  const activeLeftTabLabelRef = useRef(activeLeftTab?.label);
  const activeRightTabLabelRef = useRef(activeRightTab?.label);

  // Update refs when tabs change (with proper dependencies)
  useEffect(() => {
    activeLeftTabLabelRef.current = activeLeftTab?.label;
  }, [activeLeftTab]);

  useEffect(() => {
    activeRightTabLabelRef.current = activeRightTab?.label;
  }, [activeRightTab]);

  // Sync left tab when columns change
  // Key fix: Compare by VALUE (label), not reference - only setState when label actually changes
  useEffect(() => {
    if (!leftColumns.length) return;

    const next =
      leftColumns.find((col) => col.label === activeLeftTabLabelRef.current) ||
      leftColumns[0];

    // Only update if the label actually changed
    if (next.label !== activeLeftTabLabelRef.current) {
      setActiveLeftTab(next);
    }
  }, [leftColumns]);

  // Sync right tab when columns change
  // Key fix: Compare by VALUE (label), not reference - only setState when label actually changes
  useEffect(() => {
    if (!rightColumns.length) return;

    const next =
      rightColumns.find((col) => col.label === activeRightTabLabelRef.current) ||
      rightColumns[0];

    // Only update if the label actually changed
    if (next.label !== activeRightTabLabelRef.current) {
      setActiveRightTab(next);
    }
  }, [rightColumns]);

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
