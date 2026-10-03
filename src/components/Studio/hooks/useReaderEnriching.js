/**
 * @file useReaderEnriching.js
 * @description The reader's own Enriching Content items for one chapter,
 * persisted in localStorage via the global store. Kept separate from the
 * author's chapter items so they are never sent by submitEnrichingContents.
 */

import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useStore } from "../../../store/store";

const EMPTY = [];

const createItemId = () =>
  `re_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * @param {string} chapterId - Current chapter ID
 * @returns {{
 *   items: Object[],
 *   addItem: (item: {type: string, contentValue: string}) => void,
 *   updateItem: (id: string, item: {type: string, contentValue: string}) => void,
 *   removeItem: (id: string) => void,
 * }}
 */
const useReaderEnriching = (chapterId) => {
  const storedItems = useStore((s) => s.readerEnriching[chapterId]);
  const loadReaderEnriching = useStore((s) => s.loadReaderEnriching);
  const updateReaderEnriching = useStore((s) => s.updateReaderEnriching);

  useEffect(() => {
    if (chapterId && storedItems === undefined) {
      loadReaderEnriching(chapterId);
    }
  }, [chapterId, storedItems, loadReaderEnriching]);

  const update = useCallback(
    (updater) => {
      if (!chapterId) return;
      if (!updateReaderEnriching(chapterId, updater)) {
        toast.error(
          "Couldn't save your item in this browser (storage full or blocked). It will be lost on reload."
        );
      }
    },
    [chapterId, updateReaderEnriching]
  );

  const addItem = useCallback(
    ({ type, contentValue }) => {
      const now = Date.now();
      update((items) => [
        ...items,
        { id: createItemId(), type, contentValue, createdAt: now, updatedAt: now },
      ]);
    },
    [update]
  );

  const updateItem = useCallback(
    (id, { type, contentValue }) => {
      update((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, type, contentValue, updatedAt: Date.now() }
            : item
        )
      );
    },
    [update]
  );

  const removeItem = useCallback(
    (id) => update((items) => items.filter((item) => item.id !== id)),
    [update]
  );

  return { items: storedItems ?? EMPTY, addItem, updateItem, removeItem };
};

export default useReaderEnriching;
