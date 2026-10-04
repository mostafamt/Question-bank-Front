/**
 * Config for ReaderRightPanel — tab titles + the action buttons shown under each tab.
 * See README.md for the mockups these labels come from.
 */

export const READER_RIGHT_PANEL_TABS = {
  STUDY_BOOK: "study-book",
  REVIEW_BOOKLETS: "review-booklets",
};

export const READER_RIGHT_PANEL_TAB_CONFIG = [
  {
    id: READER_RIGHT_PANEL_TABS.STUDY_BOOK,
    title: "Study Book",
    actions: [
      { id: "toc", label: "TOC" },
      { id: "objectives", label: "Objectives" },
      { id: "recalls", label: "Recalls" },
      { id: "glossary", label: "Glossary" },
      { id: "illustratives", label: "Illustratives" },
      { id: "exercises", label: "Exercises" },
      { id: "nugget-learning", label: "Nugget Learning" },
      { id: "enrichings", label: "Enriching's" },
      { id: "personalized-learning", label: "Personalized Learning" },
    ],
  },
  {
    id: READER_RIGHT_PANEL_TABS.REVIEW_BOOKLETS,
    title: "Review Booklets",
    actions: [
      { id: "sie-notebook", label: "SieNotebook" },
      { id: "toc-review", label: "TOC" },
      { id: "summary", label: "Summary" },
      { id: "learning-nuggets", label: "Learning Nuggets" },
      { id: "exam-mocks", label: "Exam Mocks" },
      { id: "auto-check-yourself", label: "Auto Check Yourself" },
      { id: "headlights", label: "Headlights" },
      { id: "glossary-review", label: "Glossary" },
    ],
  },
];
