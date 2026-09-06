import React from "react";
import { v4 as uuidv4 } from "uuid";
import { reorder } from "../../../utils/ocr";
import { DEFAULTS, STORAGE_KEYS } from "../constants";

/**
 * Remap an index after a list item moves from `from` to `to`, so a tracked
 * position (e.g. the active page) keeps pointing at the same item.
 */
const remapIndexAfterReorder = (current, from, to) => {
  if (current === from) return to;
  if (from < current && current <= to) return current - 1;
  if (to <= current && current < from) return current + 1;
  return current;
};

const usePageNavigation = ({
  pages,
  setPages,
  insertPageAtRef,
  insertPagesAtRef,
  deletePageAtRef,
  reorderPageAtRef,
  subObject = false,
}) => {
  const [activePageIndex, setActivePageIndex] = React.useState(
    subObject
      ? DEFAULTS.ACTIVE_PAGE_INDEX
      : localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE)
      ? Number.parseInt(localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE))
      : DEFAULTS.ACTIVE_PAGE_INDEX
  );

  const activePageId = pages?.[activePageIndex]?._id;

  const getPageIndexFromPageId = (id) => {
    if (!pages || !pages.length) return 0;

    const index = pages.findIndex((p) => p._id === id);

    // If the page was not found → return the current active page index
    if (index === -1) {
      console.warn(`Page with id "${id}" not found in pages list`);
      return activePageIndex;
    }

    return index;
  };

  const changePageByIndex = (idx) => {
    setActivePageIndex(idx);
    localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${idx}`);
  };

  const changePageById = (id) => {
    const idx = getPageIndexFromPageId(id);
    changePageByIndex(idx);
  };

  const addLocalPages = (files, afterIndex) => {
    const newPageObjects = [...files].map((file) => ({
      _id: uuidv4(),
      blocks: [],
      v_blocks: [],
      url: URL.createObjectURL(file),
    }));
    const insertAt = afterIndex + 1;
    const updatedPages = [
      ...pages.slice(0, insertAt),
      ...newPageObjects,
      ...pages.slice(insertAt),
    ];
    setPages(updatedPages);
    insertPagesAtRef?.current?.(insertAt, newPageObjects);
    changePageByIndex(insertAt + newPageObjects.length - 1);
  };

  const BLANK_PAGE_URL =
    "https://res.cloudinary.com/dd9turntq/image/upload/v1782292265/xsk5iuhrifbgsma0d4un.png";

  const insertPageLocally = (insertAt, page) => {
    setPages((prev) => [
      ...prev.slice(0, insertAt),
      page,
      ...prev.slice(insertAt),
    ]);
    insertPageAtRef?.current?.(insertAt, page);
  };

  const addEmptyPage = (afterIndex, { pageId, url }) => {
    const newPage = {
      _id: pageId,
      _isPending: true,
      blocks: [],
      v_blocks: [],
      url,
    };
    const insertAt = afterIndex + 1;
    insertPageLocally(insertAt, newPage);
    changePageByIndex(insertAt);
  };

  const addImportedPages = (afterIndex, importedPages) => {
    const newPages = importedPages.map(({ pageId, url }) => ({
      _id: pageId,
      _isPending: true,
      blocks: [],
      v_blocks: [],
      url: url ?? BLANK_PAGE_URL,
    }));
    const insertAt = afterIndex + 1;
    setPages((prev) => [
      ...prev.slice(0, insertAt),
      ...newPages,
      ...prev.slice(insertAt),
    ]);
    insertPagesAtRef?.current?.(insertAt, newPages);
  };

  // Reorder a page from one position to another and keep every index-aligned
  // structure in sync: the pages array, the per-page areas/areasProperties (via
  // reorderPageAtRef), and the active page index (so the highlighted page follows
  // the page the user was on).
  const reorderPages = (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex == null ||
      toIndex == null ||
      fromIndex < 0 ||
      toIndex < 0
    )
      return;

    setPages((prev) => reorder(prev, fromIndex, toIndex));
    reorderPageAtRef?.current?.(fromIndex, toIndex);
    changePageByIndex(
      remapIndexAfterReorder(activePageIndex, fromIndex, toIndex)
    );
  };

  return {
    activePageIndex,
    setActivePageIndex,
    activePageId,
    changePageByIndex,
    changePageById,
    addLocalPages,
    addEmptyPage,
    addImportedPages,
    insertPageLocally,
    reorderPages,
  };
};

export default usePageNavigation;
