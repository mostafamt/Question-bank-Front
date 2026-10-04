/**
 * @file useReaderVBlocks.js
 * @description The reader's own virtual blocks for one page, persisted in
 * localStorage via the global store. Kept separate from Studio's author
 * `virtualBlocks` state so they are never included in a Submit.
 */

import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useStore } from "../../../store/store";

const EMPTY = {};

const createItemId = () =>
  `rb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * @param {string} pageId - `_id` of the page whose blocks are needed
 * @param {boolean} [enabled=true] - Skip loading when false (non-reader modes)
 * @returns {{
 *   readerBlocks: Object<string, {contents: Object[]}>,
 *   saveSlot: (location: string, contents: Object[]) => void,
 *   deleteSlot: (location: string) => void,
 * }}
 */
const useReaderVBlocks = (pageId, enabled = true) => {
  const { chapterId } = useParams();
  const chapterBlocks = useStore((s) => s.readerVBlocks[chapterId]);
  const loadReaderVBlocks = useStore((s) => s.loadReaderVBlocks);
  const setSlot = useStore((s) => s.setReaderVBlockSlot);

  useEffect(() => {
    if (enabled && chapterId && chapterBlocks === undefined) {
      loadReaderVBlocks(chapterId);
    }
  }, [enabled, chapterId, chapterBlocks, loadReaderVBlocks]);

  const readerBlocks = (enabled && pageId && chapterBlocks?.[pageId]) || EMPTY;

  const saveSlot = useCallback(
    (location, contents) => {
      if (!chapterId || !pageId) return;
      const now = Date.now();
      const stamped = contents.map((item) => ({
        ...item,
        id: item.id || createItemId(),
        createdAt: item.createdAt || now,
        updatedAt: now,
      }));
      if (!setSlot(chapterId, pageId, location, stamped)) {
        toast.error(
          "Couldn't save your block in this browser (storage full or blocked). It will be lost on reload."
        );
      }
    },
    [chapterId, pageId, setSlot]
  );

  const deleteSlot = useCallback(
    (location) => saveSlot(location, []),
    [saveSlot]
  );

  return { readerBlocks, saveSlot, deleteSlot };
};

export default useReaderVBlocks;
