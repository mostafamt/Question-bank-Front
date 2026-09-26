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

const useStore = create((set) => ({
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
