import React from "react";
import BookColumns2 from "../../components/Book/BookColumn2/BookColumn2";
import { getNavigationDelay } from "../../config/highlighting";
import {
  buildReaderLeftColumns,
  buildReaderRightColumns,
} from "../../components/Studio/columns";

import styles from "./bookTabsLayout.module.scss";

const BookTabsLayout = React.forwardRef((props, ref) => {
  const {
    children,
    pages: newPages,
    chapterId,
    activePage,
    setActivePage,
    onChangeActivePage,
    getBlockFromBlockId,
    hightBlock,
  } = props;

  // Navigation function to change page by ID
  const changePageById = React.useCallback(
    (pageId) => {
      if (!pageId || !newPages) return;

      const pageIndex = newPages.findIndex((page) => page._id === pageId);

      if (pageIndex === -1) {
        console.warn(`Page with id "${pageId}" not found`);
        return;
      }

      setActivePage(newPages[pageIndex]);
      if (onChangeActivePage) {
        onChangeActivePage(pageIndex);
      }
    },
    [newPages, setActivePage, onChangeActivePage]
  );

  // Navigation function to navigate to a specific block
  const navigateToBlock = React.useCallback(
    (pageId, blockId) => {
      // Navigate to the page
      changePageById(pageId);

      // Highlight the block (if highlighting functions available)
      if (hightBlock) {
        // Add small delay to ensure page has changed
        setTimeout(() => {
          hightBlock(blockId);
        }, getNavigationDelay());
      } else {
        // Fallback: just log (for contexts without highlighting)
        console.log(`Navigated to block ${blockId} on page ${pageId}`);
      }
    },
    [changePageById, hightBlock]
  );

  // Build columns using centralized reader builders
  const LEFT_COLUMNS = buildReaderLeftColumns({
    pages: newPages,
    activePage,
    setActivePage,
    onChangeActivePage,
    changePageById,
    navigateToBlock,
    chapterId,
    thumbnailsRef: ref,
  });

  const RIGHT_COLUMNS = buildReaderRightColumns({
    pages: newPages,
    setActivePage,
    onChangeActivePage,
    changePageById,
    navigateToBlock,
    chapterId,
  });

  return (
    <div className={styles["book-content-layout"]}>
      <BookColumns2
        columns={LEFT_COLUMNS}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div>{children}</div>
      <BookColumns2 columns={RIGHT_COLUMNS} />
    </div>
  );
});

export default BookTabsLayout;
