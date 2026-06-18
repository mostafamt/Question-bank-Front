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

  return {
    activePageIndex,
    setActivePageIndex,
    activePageId,
    changePageByIndex,
    changePageById,
    addLocalPages,
  };
};

export default usePageNavigation;
