import React, { useState, useCallback, useRef } from "react";
import { useParams, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { getChapterPages } from "../../api/bookapi";
import { INITIAL_PAGE_INDEX } from "../../utils/book";
import { tabsConfig } from "../../config/reader";
import {
  HIGHLIGHT_CONFIG,
  getAutoClearTimeout,
  isDebugEnabled,
} from "../../config/highlighting";
import BookHeaderLayout from "../../layouts/BookHeaderLayout/BookHeaderLayout";
import BookTabsLayout from "../../layouts/BookTabsLayout/BookTabsLayout";
import { useStore } from "../../store/store";

const Book = () => {
  const { bookId, chapterId } = useParams();
  const location = useLocation();
  const chapterLanguage = location.state?.language;
  const setLanguage = useStore((s) => s.setLanguage);

  React.useEffect(() => {
    if (chapterLanguage) {
      setLanguage(chapterLanguage);
    }
  }, [chapterLanguage, setLanguage]);
  const { data: pages = [], isFetching } = useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],
    queryFn: () => getChapterPages(chapterId),
    refetchOnWindowFocus: false,
  });
  const [outerValue, setOuterValue] = React.useState(0); // top-level tabs
  const [innerValue, setInnerValue] = React.useState(0); // nested tabs
  const [activePage, setActivePage] = useState(null);
  const thumbnailsRef = React.useRef(null);
  const highlightTimeoutRef = useRef(null);
  const [highlightedBlockId, setHighlightedBlockId] = React.useState(null);

  const [areas, setAreas] = React.useState(
    pages?.map((page) =>
      page.blocks?.map((block) => {
        return {
          id: block.blockId,
          x: block.coordinates.x,
          y: block.coordinates.y,
          width: block.coordinates.width,
          height: block.coordinates.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          _unit: block.coordinates.unit,
          _updated: false,
        };
      })
    ) || Array(pages?.length || 1).fill([])
  );

  React.useEffect(() => {
    if (pages?.length) {
      setActivePage(pages[INITIAL_PAGE_INDEX]);
    }
  }, [pages]);

  // Update areas when pages data changes
  React.useEffect(() => {
    if (pages?.length) {
      const newAreas = pages.map((page) =>
        page.blocks?.map((block) => ({
          id: block.blockId,
          x: block.coordinates.x,
          y: block.coordinates.y,
          width: block.coordinates.width,
          height: block.coordinates.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          _unit: block.coordinates.unit,
          _updated: false,
        })) || []
      );
      setAreas(newAreas);
    }
  }, [pages]);

  const onChangeActivePage = (action, source = "thumbnails") => {
    setActivePage((prevPage) => {
      let newPage = prevPage;

      // Case 1: Direct page object
      if (typeof action === "object" && action?._id) {
        newPage = action;
      } else {
        // Case 2: Action string
        const currentIndex = pages.findIndex((p) => p._id === prevPage._id);

        switch (action) {
          case "next":
            newPage = pages[Math.min(currentIndex + 1, pages.length - 1)];
            break;
          case "prev":
            newPage = pages[Math.max(currentIndex - 1, 0)];
            break;
          case "first":
            newPage = pages[0];
            break;
          case "last":
            newPage = pages[pages.length - 1];
            break;
          default:
            newPage = prevPage;
        }
      }

      if (thumbnailsRef.current) {
        const container = thumbnailsRef.current;
        const index = pages.findIndex((p) => p._id === newPage._id);

        if (index !== -1) {
          const btn = container.querySelector(`button:nth-child(${index + 1})`);
          if (btn) {
            const offset = container.clientHeight * 0.03; // 3% of container height

            container.scrollTo({
              top: btn.offsetTop - offset,
              behavior: "smooth",
            });
          }
        }
      }

      return newPage;
    });
  };

  /**
   * Find a block by its ID across all pages
   * @param {string} blockId - The block ID to search for
   * @returns {Object|null} Block object with pageIndex or null if not found
   */
  const getBlockFromBlockId = useCallback(
    (blockId) => {
      if (!blockId || !pages?.length) return null;

      // Search through all pages
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const block = pages[pageIndex].blocks?.find(
          (b) => b.blockId === blockId
        );

        if (block) {
          return {
            ...block,
            pageIndex,
            pageId: pages[pageIndex]._id,
          };
        }
      }

      if (isDebugEnabled()) {
        console.warn(`Block with id "${blockId}" not found`);
      }
      return null;
    },
    [pages]
  );

  /**
   * Highlight a block by its ID
   * Auto-clears highlight after configured timeout
   * @param {string} blockId - The block ID to highlight
   */
  const hightBlock = useCallback(
    (blockId) => {
      if (!blockId) {
        if (isDebugEnabled()) {
          console.warn("hightBlock called without blockId");
        }
        return;
      }

      // Verify block exists
      const block = getBlockFromBlockId(blockId);
      if (!block) {
        if (isDebugEnabled()) {
          console.warn(`Cannot highlight non-existent block: ${blockId}`);
        }
        return;
      }

      // Clear any existing timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      if (isDebugEnabled()) {
        console.log(`Highlighting block: ${blockId}`);
      }

      setHighlightedBlockId(blockId);

      // Auto-clear highlight after timeout (if enabled)
      const timeout = getAutoClearTimeout();
      if (timeout) {
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedBlockId(null);
          if (isDebugEnabled()) {
            console.log(`Cleared highlight for block: ${blockId}`);
          }
        }, timeout);
      }
    },
    [getBlockFromBlockId]
  );

  if (isFetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  const outerTab = tabsConfig[outerValue];
  const innerTab = outerTab.children[innerValue];
  const InnerComponent = innerTab.component;

  return (
    <BookHeaderLayout>
      <BookTabsLayout
        pages={pages}
        chapterId={chapterId}
        activePage={activePage}
        setActivePage={setActivePage}
        onChangeActivePage={onChangeActivePage}
        ref={thumbnailsRef}
        getBlockFromBlockId={getBlockFromBlockId}
        hightBlock={hightBlock}
      >
        <InnerComponent
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          onChangeActivePage={onChangeActivePage}
          highlightedBlockId={highlightedBlockId}
        />
      </BookTabsLayout>
    </BookHeaderLayout>
  );
};

export default Book;
