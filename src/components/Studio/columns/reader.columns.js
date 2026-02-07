// reader.columns.js
import StudioThumbnails from "../StudioThumbnails/StudioThumbnails";
import List from "../../Tabs/List/List";
import TableOfContents from "../../Book/TableOfContents/TableOfContents";
import GlossaryAndKeywords from "../../Tabs/GlossaryAndKeywords/GlossaryAndKeywords";
import ExerciseTab from "../components/ExerciseTab/ExerciseTab";
import { LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../constants";
import { getTabsForSidebar } from "../../../utils/tabFiltering";

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
  // Get filtered tabs for reader mode
  const tabConfigs = getTabsForSidebar("left", "reader");

  // Map tab configs to column objects
  return tabConfigs
    .map((config) => {
      switch (config.id) {
        case "thumbnails":
          // Find active page index for StudioThumbnails
          const activePageIndex = pages?.findIndex((p) => p._id === activePage?._id) ?? 0;

          return {
            id: config.id,
            label: config.label,
            component: (
              <StudioThumbnails
                pages={pages}
                activePage={activePageIndex}
                onClickImage={(index) => {
                  const page = pages[index];
                  if (page && setActivePage) setActivePage(page);
                  if (page && onChangeActivePage) onChangeActivePage(page);
                }}
                ref={thumbnailsRef}
              />
            ),
          };

        case "recalls":
          return {
            id: config.id,
            label: config.label,
            component: (
              <List
                chapterId={chapterId}
                tab={LEFT_TAB_NAMES.RECALLS}
                reader
                changePageById={changePageById}
                navigateToBlock={navigateToBlock}
              />
            ),
          };

        case "micro-learning":
          return {
            id: config.id,
            label: config.label,
            component: (
              <List
                chapterId={chapterId}
                tab={LEFT_TAB_NAMES.MICRO_LEARNING}
                reader
                changePageById={changePageById}
                navigateToBlock={navigateToBlock}
              />
            ),
          };

        case "enriching-content":
          return {
            id: config.id,
            label: config.label,
            component: (
              <List
                chapterId={chapterId}
                tab={LEFT_TAB_NAMES.ENRICHING_CONTENT}
                reader
                changePageById={changePageById}
                navigateToBlock={navigateToBlock}
              />
            ),
          };

        default:
          console.warn(`Unknown reader left tab ID: ${config.id}`);
          return null;
      }
    })
    .filter(Boolean); // Remove nulls
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
  // Get filtered tabs for reader mode
  const tabConfigs = getTabsForSidebar("right", "reader");

  // Map tab configs to column objects
  return tabConfigs
    .map((config) => {
      switch (config.id) {
        case "table-of-contents":
          return {
            id: config.id,
            label: config.label,
            component: (
              <TableOfContents
                pages={pages}
                setActivePage={setActivePage}
                chapterId={chapterId}
                onChangeActivePage={onChangeActivePage}
              />
            ),
          };

        case "glossary-keywords":
          return {
            id: config.id,
            label: config.label,
            component: (
              <List
                chapterId={chapterId}
                tab={RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS}
                reader
                changePageById={changePageById}
                navigateToBlock={navigateToBlock}
              />
            ),
          };

        case "illustrative-interactions":
          return {
            id: config.id,
            label: config.label,
            component: (
              <List
                chapterId={chapterId}
                tab={RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS}
                reader
                changePageById={changePageById}
                navigateToBlock={navigateToBlock}
              />
            ),
          };

        case "check-yourself-right":
          return {
            id: config.id,
            label: config.label,
            component: (
              <List
                chapterId={chapterId}
                tab={LEFT_TAB_NAMES.CHECK_YOURSELF}
                reader
                changePageById={changePageById}
                navigateToBlock={navigateToBlock}
              />
            ),
          };

        case "exercise-right":
          return {
            id: config.id,
            label: config.label,
            component: <ExerciseTab chapterId={chapterId} />,
          };

        default:
          console.warn(`Unknown reader right tab ID: ${config.id}`);
          return null;
      }
    })
    .filter(Boolean); // Remove nulls
};
