/**
 * @file tabs.constants.js
 * @description Tab names and configurations for Studio component
 */

/**
 * Left column tab names
 */
export const LEFT_TAB_NAMES = {
  THUMBNAILS: "Thumbnails",
  RECALLS: "Recalls",
  MICRO_LEARNING: "Micro Learning",
  ENRICHING_CONTENT: "Enriching Content",
  CHECK_YOURSELF: "Check Yourself",
};

/**
 * Right column tab names
 */
export const RIGHT_TAB_NAMES = {
  BLOCK_AUTHORING: "Block Authoring",
  COMPOSITE_BLOCKS: "Composite Blocks",
  TABLE_OF_CONTENTS: "Table Of Contents",
  GLOSSARY_KEYWORDS: "Glossary & keywords",
  ILLUSTRATIVE_INTERACTIONS: "Illustrative Interactions",
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
