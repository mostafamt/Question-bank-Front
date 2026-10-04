import { create } from "zustand";
import { STORAGE_KEYS } from "../components/Studio/constants/studio.constants";

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// localStorage can throw (blocked site data) or hold malformed JSON — treat
// either case as the empty fallback rather than crashing the reader.
const readJSON = (key, fallback, isValid) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// Returns false when the write failed (blocked storage or quota exceeded);
// the value then stays in memory for this session only.
const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const bookmarksKey = (chapterId) =>
  `${STORAGE_KEYS.READER_BOOKMARKS}_${chapterId}`;
const readBookmarks = (chapterId) =>
  readJSON(bookmarksKey(chapterId), [], Array.isArray);
const writeBookmarks = (chapterId, pageIds) =>
  writeJSON(bookmarksKey(chapterId), pageIds);

const readerVBlocksKey = (chapterId) =>
  `${STORAGE_KEYS.READER_VBLOCKS}_${chapterId}`;
const readReaderVBlocks = (chapterId) =>
  readJSON(readerVBlocksKey(chapterId), {}, isPlainObject);
const writeReaderVBlocks = (chapterId, pages) =>
  writeJSON(readerVBlocksKey(chapterId), pages);

const readerEnrichingKey = (chapterId) =>
  `${STORAGE_KEYS.READER_ENRICHING}_${chapterId}`;
const readReaderEnriching = (chapterId) =>
  readJSON(readerEnrichingKey(chapterId), [], Array.isArray);
const writeReaderEnriching = (chapterId, items) =>
  writeJSON(readerEnrichingKey(chapterId), items);

const useStore = create((set, get) => ({
  language: localStorage.getItem("language") || "en",
  setLanguage: (lang) => {
    localStorage.setItem("language", lang);
    set({ language: lang });
  },
  // Reader page bookmarks, keyed by chapterId → array of page _ids.
  // A chapter's entry is loaded from localStorage on first use.
  bookmarks: {},
  loadBookmarks: (chapterId) =>
    set((prev) => ({
      bookmarks: { ...prev.bookmarks, [chapterId]: readBookmarks(chapterId) },
    })),
  toggleBookmark: (chapterId, pageId) =>
    set((prev) => {
      const current = prev.bookmarks[chapterId] ?? readBookmarks(chapterId);
      const next = current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId];
      writeBookmarks(chapterId, next);
      return { bookmarks: { ...prev.bookmarks, [chapterId]: next } };
    }),
  // The reader's own virtual blocks, kept apart from the author's v_blocks so
  // they can never reach saveBlocks.
  // Shape: { [chapterId]: { [pageId]: { [iconLocation]: { contents } } } }
  readerVBlocks: {},
  loadReaderVBlocks: (chapterId) =>
    set((prev) => ({
      readerVBlocks: {
        ...prev.readerVBlocks,
        [chapterId]: readReaderVBlocks(chapterId),
      },
    })),
  /**
   * Replace one slot's contents; an empty array deletes the slot.
   * @returns {boolean} false if the change could not be persisted
   */
  setReaderVBlockSlot: (chapterId, pageId, location, contents) => {
    const chapter =
      get().readerVBlocks[chapterId] ?? readReaderVBlocks(chapterId);
    const page = { ...(chapter[pageId] ?? {}) };
    if (contents.length > 0) {
      page[location] = { contents };
    } else {
      delete page[location];
    }
    const nextChapter = { ...chapter };
    if (Object.keys(page).length > 0) {
      nextChapter[pageId] = page;
    } else {
      delete nextChapter[pageId];
    }
    const persisted = writeReaderVBlocks(chapterId, nextChapter);
    set((prev) => ({
      readerVBlocks: { ...prev.readerVBlocks, [chapterId]: nextChapter },
    }));
    return persisted;
  },
  // The reader's own Enriching Content items, kept apart from the author's
  // chapter items so they are never sent by submitEnrichingContents.
  // Shape: { [chapterId]: Item[] }
  readerEnriching: {},
  loadReaderEnriching: (chapterId) =>
    set((prev) => ({
      readerEnriching: {
        ...prev.readerEnriching,
        [chapterId]: readReaderEnriching(chapterId),
      },
    })),
  /**
   * Update a chapter's reader items.
   * @param {(items: Object[]) => Object[]} updater - receives the current items
   * @returns {boolean} false if the change could not be persisted
   */
  updateReaderEnriching: (chapterId, updater) => {
    const current =
      get().readerEnriching[chapterId] ?? readReaderEnriching(chapterId);
    const items = updater(current);
    const persisted = writeReaderEnriching(chapterId, items);
    set((prev) => ({
      readerEnriching: { ...prev.readerEnriching, [chapterId]: items },
    }));
    return persisted;
  },
  data: {},
  modal: {
    name: "",
    size: "xl",
    opened: false,
    props: {},
  },
  setFormState: (data) =>
    set((prevState) => ({ data: { ...prevState.data, ...data } })),

  openModal: (name, props = {}) =>
    set((prev) => ({
      modal: {
        ...prev.modal,
        name,
        opened: true,
        props,
      },
    })),

  closeModal: () =>
    set((prev) => ({
      modal: {
        ...prev.modal,
        name: "",
        opened: false,
        props: {},
      },
    })),
}));

export { useStore };
