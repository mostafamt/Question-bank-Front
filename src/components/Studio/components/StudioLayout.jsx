/**
 * @file StudioLayout.jsx
 * @description Three-column layout for Studio (left panel, editor, right panel)
 */

import React from "react";
import StudioEditor from "../StudioEditor/StudioEditor";
import BookColumn from "../../Book/BookColumn/BookColumn";
import StudioMobileTabBar from "./StudioMobileTabBar";
import useBreakpoint from "../../../hooks/useBreakpoint";
import styles from "../studio.module.scss";

/**
 * Studio Layout Component
 * Contains the three-column grid: left panel, editor, right panel.
 * Below desktop the panels become icon rails + drawers (tablet) or a bottom
 * tab bar + bottom sheets (phone).
 *
 * @param {Object} props - Component props
 */
const StudioLayout = React.forwardRef(
  (
    {
      // Refs
      pageContainerRef,

      // Left column props
      leftColumns,
      activeLeftTab,
      setActiveLeftTab,

      // Right column props
      rightColumns,
      activeRightTab,
      setActiveRightTab,

      // Editor props
      areasProperties,
      setAreasProperties,
      activePageIndex,
      imageScaleFactor,
      setImageScaleFactor,
      areas,
      setAreas,
      onChangeHandler,
      pages,
      onImageLoad,
      virtualBlocks,
      setVirtualBlocks,
      showVB,
      onClickToggleVirtualBlocks,
      onClickImage,
      compositeBlocksTypes,
      compositeBlocks,
      setCompositeBlocks,
      highlight,
      setHighlight,
      highlightedBlockId,
      onPlayBlock,
      onClickDeleteArea,
      updateAreaPropertyById,
      showBlocksStyling,
      setShowBlocksStyling,
      deletedDeepBlockAreas,
      isWhiteOutMode,
      onToggleWhiteOutMode,
      addManualWhiteOverlayArea,
      removeWhiteOverlayArea,
      chapterId,
      publishLanguage,
      ocrLanguage,
      setOcrLanguage,
    },
    ref
  ) => {
    const { isPhone } = useBreakpoint();
    // Below desktop, picking a page or block inside a panel minimizes it
    const navigationKey = `${activePageIndex}:${highlightedBlockId ?? ""}`;

    const editor = (
      <StudioEditor
        ref={ref}
        pageContainerRef={pageContainerRef}
        areasProperties={areasProperties}
        setAreasProperties={setAreasProperties}
        activePage={activePageIndex}
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        onChangeHandler={onChangeHandler}
        pages={pages}
        onImageLoad={onImageLoad}
        virtualBlocks={virtualBlocks}
        setVirtualBlocks={setVirtualBlocks}
        showVB={showVB}
        onClickToggleVirutalBlocks={onClickToggleVirtualBlocks}
        onClickImage={onClickImage}
        activeRightTab={activeRightTab}
        compositeBlocksTypes={compositeBlocksTypes}
        compositeBlocks={compositeBlocks}
        setCompositeBlocks={setCompositeBlocks}
        highlight={highlight}
        setHighlight={setHighlight}
        highlightedBlockId={highlightedBlockId}
        onPlayBlock={onPlayBlock}
        onClickDeleteArea={onClickDeleteArea}
        updateAreaPropertyById={updateAreaPropertyById}
        showBlocksStyling={showBlocksStyling}
        setShowBlocksStyling={setShowBlocksStyling}
        deletedDeepBlockAreas={deletedDeepBlockAreas}
        isWhiteOutMode={isWhiteOutMode}
        onToggleWhiteOutMode={onToggleWhiteOutMode}
        addManualWhiteOverlayArea={addManualWhiteOverlayArea}
        removeWhiteOverlayArea={removeWhiteOverlayArea}
        chapterId={chapterId}
        publishLanguage={publishLanguage}
        ocrLanguage={ocrLanguage}
        setOcrLanguage={setOcrLanguage}
      />
    );

    if (isPhone) {
      return (
        <div className={styles.studio}>
          {editor}
          <StudioMobileTabBar
            leftColumns={leftColumns}
            rightColumns={rightColumns}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
            activeRightTab={activeRightTab}
            setActiveRightTab={setActiveRightTab}
            onImageLoad={onImageLoad}
            navigationKey={navigationKey}
          />
        </div>
      );
    }

    return (
      <div className={styles.studio}>
        {/* Left Panel */}
        <BookColumn
          COLUMNS={leftColumns}
          activeColumn={leftColumns[0]}
          onImageLoad={onImageLoad}
          activeTab={activeLeftTab}
          setActiveTab={setActiveLeftTab}
          responsive
          side="left"
          navigationKey={navigationKey}
        />

        {/* Main Editor */}
        {editor}

        {/* Right Panel */}
        <BookColumn
          COLUMNS={rightColumns}
          activeColumn={rightColumns[0]}
          onImageLoad={onImageLoad}
          activeTab={activeRightTab}
          setActiveTab={setActiveRightTab}
          responsive
          side="right"
          navigationKey={navigationKey}
        />
      </div>
    );
  },
);

StudioLayout.displayName = "StudioLayout";

export default StudioLayout;
