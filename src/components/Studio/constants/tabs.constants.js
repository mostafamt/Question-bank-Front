/**
 * @file tabs.constants.js
 * @description Tab names and configurations for Studio component
 */

/**
 * Left column tab names
 */
export const LEFT_TAB_NAMES = {
  THUMBNAILS: {
    label: "Thumbnails",
    name: "thumbnails",
  },
  RECALLS: {
    label: "Recalls",
    name: "recalls",
  },
  MICRO_LEARNING: {
    label: "Micro Learning",
    name: "micro-los",
  },
  ENRICHING_CONTENT: {
    label: "Enriching Content",
    name: "enriching-contents",
  },
  CHECK_YOURSELF: {
    label: "Check Yourself",
    name: "question-objects",
  },
  EXERCISE: {
    label: "Exercise",
    name: "exercise",
  },
};

/**
 * Right column tab names
 */
export const RIGHT_TAB_NAMES = {
  BLOCK_AUTHORING: {
    label: "Block Authoring",
    name: "block-authoring",
  },
  COMPOSITE_BLOCKS: {
    label: "Composite Blocks",
    name: "composite-blocks",
  },
  TABLE_OF_CONTENTS: {
    label: "Table of Contents",
    name: "table-of-contents",
  },
  GLOSSARY_KEYWORDS: {
    label: "Glossary & Keywords",
    name: "glossary",
  },
  ILLUSTRATIVE_INTERACTIONS: {
    label: "Illustrative Interactions",
    name: "illustrative-objects",
  },
};

/**
 * All tab names (for backward compatibility)
 * @deprecated Use LEFT_TAB_NAMES or RIGHT_TAB_NAMES instead
 */
export const TAB_NAMES = {
  ...LEFT_TAB_NAMES,
  ...RIGHT_TAB_NAMES,
};

/**
 * List of tab names used in the tabNames array
 */
export const TAB_NAMES_LIST = [
  LEFT_TAB_NAMES.RECALLS,
  LEFT_TAB_NAMES.MICRO_LEARNING,
  LEFT_TAB_NAMES.ENRICHING_CONTENT,
  LEFT_TAB_NAMES.CHECK_YOURSELF,
  RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS,
];
