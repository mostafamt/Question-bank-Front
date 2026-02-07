/**
 * @file StudioLayout.jsx
 * @description Three-column layout for Studio (left panel, editor, right panel)
 */

import React from "react";
import StudioEditor from "../StudioEditor/StudioEditor";
import BookColumn from "../../Book/BookColumn/BookColumn";
import styles from "../studio.module.scss";

/**
 * Studio Layout Component
 * Contains the three-column grid: left panel, editor, right panel
 *
 * @param {Object} props - Component props
 */
const StudioLayout = React.forwardRef(
  (
    {
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
    },
    ref
  ) => {
    return (
      <div className={styles.studio}>
        {/* Left Panel */}
        <BookColumn
          COLUMNS={leftColumns}
          activeColumn={leftColumns[0]}
          onImageLoad={onImageLoad}
          activeTab={activeLeftTab}
          setActiveTab={setActiveLeftTab}
        />

        {/* Main Editor */}
        <StudioEditor
          ref={ref}
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
        />

        {/* Right Panel */}
        <BookColumn
          COLUMNS={rightColumns}
          activeColumn={rightColumns[0]}
          onImageLoad={onImageLoad}
          activeTab={activeRightTab}
          setActiveTab={setActiveRightTab}
        />
      </div>
    );
  }
);

StudioLayout.displayName = "StudioLayout";

export default StudioLayout;
