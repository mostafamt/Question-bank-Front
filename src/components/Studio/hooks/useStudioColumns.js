/**
 * @file useStudioColumns.js
 * @description Hook for building Studio left and right column configurations
 * Centralizes the complex column building logic from Studio.jsx
 */

import React from "react";
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
  /**
   * Navigate to a specific block
   */
  const navigateToBlock = React.useCallback(
    (pageId, blockId) => {
      changePageById(pageId);
      hightBlock(blockId);
    },
    [changePageById, hightBlock]
  );

  /**
   * Set active page from page object
   */
  const setActivePage = React.useCallback(
    (page) => {
      const idx = pages.findIndex((p) => p._id === page._id);
      if (idx !== -1) changePageByIndex(idx);
    },
    [pages, changePageByIndex]
  );

  /**
   * Build left columns based on mode
   */
  const leftColumns = React.useMemo(() => {
    if (isReaderMode) {
      return buildReaderLeftColumns({
        pages,
        activePage: pages?.[activePageIndex],
        setActivePage,
        onChangeActivePage: setActivePage,
        changePageById,
        navigateToBlock,
        chapterId,
        thumbnailsRef,
      });
    }

    return buildLeftColumns({
      pages,
      chapterId,
      activePageIndex,
      changePageByIndex,
      thumbnailsRef,
      changePageById,
      getBlockFromBlockId,
      hightBlock,
    });
  }, [
    isReaderMode,
    pages,
    activePageIndex,
    chapterId,
    thumbnailsRef,
    changePageByIndex,
    changePageById,
    getBlockFromBlockId,
    hightBlock,
    setActivePage,
    navigateToBlock,
  ]);

  /**
   * Build right columns based on mode
   */
  const rightColumns = React.useMemo(() => {
    if (isReaderMode) {
      return buildReaderRightColumns({
        pages,
        setActivePage,
        onChangeActivePage: setActivePage,
        changePageById,
        navigateToBlock,
        chapterId,
      });
    }

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
      changePageById,
      getBlockFromBlockId,
      hightBlock,
      changePageByIndex,
      onClickHand,
    });
  }, [
    isReaderMode,
    pages,
    activePageIndex,
    chapterId,
    setActivePage,
    navigateToBlock,
    changePageById,
    getBlockFromBlockId,
    hightBlock,
    changePageByIndex,
    rightColumnProps,
  ]);

  // Tab state
  const [activeLeftTab, setActiveLeftTab] = React.useState(leftColumns[0]);
  const [activeRightTab, setActiveRightTab] = React.useState(rightColumns[0]);

  // Sync tabs when columns change
  // Use id/label comparison instead of reference equality
  // Don't reset if tab is intentionally closed (falsy value like "")
  React.useEffect(() => {
    if (!activeLeftTab) return;
    if (leftColumns.length > 0) {
      // Find matching column by id or label (not reference equality)
      const matchingColumn = leftColumns.find(
        (col) => col.id === activeLeftTab.id || col.label === activeLeftTab.label
      );
      if (matchingColumn) {
        // Update to new reference if content matches but reference changed
        if (matchingColumn !== activeLeftTab) {
          setActiveLeftTab(matchingColumn);
        }
      } else {
        // Tab no longer exists in columns, reset to first
        setActiveLeftTab(leftColumns[0]);
      }
    }
  }, [leftColumns, activeLeftTab]);

  React.useEffect(() => {
    if (!activeRightTab) return;
    if (rightColumns.length > 0) {
      // Find matching column by id or label (not reference equality)
      const matchingColumn = rightColumns.find(
        (col) => col.id === activeRightTab.id || col.label === activeRightTab.label
      );
      if (matchingColumn) {
        // Update to new reference if content matches but reference changed
        if (matchingColumn !== activeRightTab) {
          setActiveRightTab(matchingColumn);
        }
      } else {
        // Tab no longer exists in columns, reset to first
        setActiveRightTab(rightColumns[0]);
      }
    }
  }, [rightColumns, activeRightTab]);

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
