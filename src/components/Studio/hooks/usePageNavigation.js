import React from "react";
import { v4 as uuidv4 } from "uuid";
import { DEFAULTS, STORAGE_KEYS } from "../constants";

const createBlankPageUrl = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 794;
  canvas.height = 1123;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
};

const usePageNavigation = ({
  pages,
  setPages,
  insertPageAtRef,
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

  const addBlankPage = (afterIndex) => {
    const url = createBlankPageUrl();
    const newPage = { _id: uuidv4(), blocks: [], v_blocks: [], url };
    const insertAt = afterIndex + 1;
    const newPages = [
      ...pages.slice(0, insertAt),
      newPage,
      ...pages.slice(insertAt),
    ];
    setPages(newPages);
    insertPageAtRef?.current?.(insertAt, newPage);
    changePageByIndex(insertAt);
  };

  return {
    activePageIndex,
    setActivePageIndex,
    activePageId,
    changePageByIndex,
    changePageById,
    addBlankPage,
  };
};

export default usePageNavigation;
