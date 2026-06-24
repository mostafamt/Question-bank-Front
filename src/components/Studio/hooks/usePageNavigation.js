import React from "react";
import { v4 as uuidv4 } from "uuid";
import { DEFAULTS, STORAGE_KEYS } from "../constants";

const usePageNavigation = ({
  pages,
  setPages,
  insertPageAtRef,
  insertPagesAtRef,
  deletePageAtRef,
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
  };
};

export default usePageNavigation;
