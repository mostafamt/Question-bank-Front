import { create } from "zustand";
import { STORAGE_KEYS } from "../components/Studio/constants/studio.constants";

const bookmarksKey = (chapterId) =>
  `${STORAGE_KEYS.READER_BOOKMARKS}_${chapterId}`;

// localStorage can throw (blocked site data) or hold malformed JSON — treat
// either case as "no bookmarks" rather than crashing the reader.
const readBookmarks = (chapterId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(bookmarksKey(chapterId)));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBookmarks = (chapterId, pageIds) => {
  try {
    localStorage.setItem(bookmarksKey(chapterId), JSON.stringify(pageIds));
  } catch {
    // Storage unavailable — bookmarks stay in memory for this session only.
  }
};

const readerVBlocksKey = (chapterId) =>
  `${STORAGE_KEYS.READER_VBLOCKS}_${chapterId}`;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Same failure handling as bookmarks: unreadable storage means "no reader blocks".
const readReaderVBlocks = (chapterId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(readerVBlocksKey(chapterId)));
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

// Returns false when the write failed (blocked storage or quota exceeded).
const writeReaderVBlocks = (chapterId, pages) => {
  try {
    localStorage.setItem(readerVBlocksKey(chapterId), JSON.stringify(pages));
    return true;
  } catch {
    return false;
  }
};

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
