// reader.columns.js
import { v4 as uuidv4 } from "uuid";
import BookThumnails from "../../Book/BookThumnails/BookThumnails";
import List from "../../Tabs/List/List";
import TableOfContents from "../../Book/TableOfContents/TableOfContents";
import GlossaryAndKeywords from "../../Tabs/GlossaryAndKeywords/GlossaryAndKeywords";
import { LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../constants";

/**
 * Build left columns for Book/Reader mode
 * @param {Object} params
 * @param {Array} params.pages - Array of page objects
 * @param {Object} params.activePage - Currently active page
 * @param {Function} params.setActivePage - Set active page
 * @param {Function} params.onChangeActivePage - Page change handler
 * @param {Function} params.changePageById - Navigate to page by ID
 * @param {Function} params.navigateToBlock - Navigate to block
 * @param {string} params.chapterId - Current chapter ID
 * @param {Object} params.thumbnailsRef - Ref for thumbnails component
 * @returns {Array} Array of column configurations
 */
export const buildReaderLeftColumns = ({
  pages,
  activePage,
  setActivePage,
  onChangeActivePage,
  changePageById,
  navigateToBlock,
  chapterId,
  thumbnailsRef,
}) => {
  return [
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.THUMBNAILS.label,
      component: (
        <BookThumnails
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          onChangeActivePage={onChangeActivePage}
          ref={thumbnailsRef}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.RECALLS.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.RECALLS}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.MICRO_LEARNING.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.MICRO_LEARNING}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.ENRICHING_CONTENT.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.ENRICHING_CONTENT}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
  ];
};

/**
 * Build right columns for Book/Reader mode
 * @param {Object} params
 * @param {Array} params.pages - Array of page objects
 * @param {Function} params.setActivePage - Set active page
 * @param {Function} params.onChangeActivePage - Page change handler
 * @param {Function} params.changePageById - Navigate to page by ID
 * @param {Function} params.navigateToBlock - Navigate to block
 * @param {string} params.chapterId - Current chapter ID
 * @returns {Array} Array of column configurations
 */
export const buildReaderRightColumns = ({
  pages,
  setActivePage,
  onChangeActivePage,
  changePageById,
  navigateToBlock,
  chapterId,
}) => {
  return [
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.TABLE_OF_CONTENTS.label,
      component: (
        <TableOfContents
          pages={pages}
          setActivePage={setActivePage}
          chapterId={chapterId}
          onChangeActivePage={onChangeActivePage}
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.label,
      component: (
        <List
          chapterId={chapterId}
          tab={RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS.label,
      component: (
        <List
          chapterId={chapterId}
          tab={RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.CHECK_YOURSELF.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.CHECK_YOURSELF}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
  ];
};
