/**
 * @file usePageBookmarks.js
 * @description Reader page bookmarks for the current chapter, persisted in
 * localStorage via the global store so every consumer (both toolbars and the
 * thumbnails) stays in sync.
 */

import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../../store/store";

const EMPTY = [];

/**
 * @returns {{
 *   bookmarkedIds: string[],
 *   isBookmarked: (pageId: string) => boolean,
 *   toggleBookmark: (pageId: string) => void,
 * }}
 */
const usePageBookmarks = () => {
  const { chapterId } = useParams();
  const storedIds = useStore((s) => s.bookmarks[chapterId]);
  const loadBookmarks = useStore((s) => s.loadBookmarks);
  const toggle = useStore((s) => s.toggleBookmark);

  useEffect(() => {
    if (chapterId && storedIds === undefined) {
      loadBookmarks(chapterId);
    }
  }, [chapterId, storedIds, loadBookmarks]);

  const bookmarkedIds = storedIds ?? EMPTY;
  const idSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  const isBookmarked = useCallback(
    (pageId) => Boolean(pageId) && idSet.has(pageId),
    [idSet]
  );

  const toggleBookmark = useCallback(
    (pageId) => {
      if (chapterId && pageId) toggle(chapterId, pageId);
    },
    [chapterId, toggle]
  );

  return { bookmarkedIds, isBookmarked, toggleBookmark };
};

export default usePageBookmarks;
