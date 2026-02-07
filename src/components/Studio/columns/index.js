// studio.columns.js
import StudioThumbnails from "../StudioThumbnails/StudioThumbnails";
import List from "../../Tabs/List/List";
import TableOfContents from "../../Book/TableOfContents/TableOfContents";
import GlossaryAndKeywords from "../../Tabs/GlossaryAndKeywords/GlossaryAndKeywords";
import StudioCompositeBlocks from "../StudioCompositeBlocks/StudioCompositeBlocks";
import StudioActions from "../StudioActions/StudioActions";
import ExerciseTab from "../components/ExerciseTab/ExerciseTab";
import { LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../constants";
import { getTabsForSidebar } from "../../../utils/tabFiltering";

export const buildLeftColumns = ({
  pages,
  chapterId,
  activePageIndex,
  changePageByIndex,
  thumbnailsRef,
  changePageById,
  getBlockFromBlockId,
  hightBlock,
}) => {
  // Create navigation function that combines page change and highlighting
  const navigateToBlock = (pageId, blockId) => {
    if (changePageById) changePageById(pageId);
    if (getBlockFromBlockId) getBlockFromBlockId(blockId);
    if (hightBlock) hightBlock(blockId);
  };

  // Get filtered tabs for studio mode
  const tabConfigs = getTabsForSidebar('left', 'studio');

  // Map tab configs to column objects
  return tabConfigs.map(config => {
    switch (config.id) {
      case 'thumbnails':
        return {
          id: config.id,
          label: config.label,
          component: (
            <StudioThumbnails
              pages={pages}
              activePage={activePageIndex}
              onClickImage={changePageByIndex}
              ref={thumbnailsRef}
            />
          ),
        };

      case 'recalls':
        return {
          id: config.id,
          label: config.label,
          component: (
            <List
              chapterId={chapterId}
              tab={LEFT_TAB_NAMES.RECALLS}
              changePageById={changePageById}
              navigateToBlock={navigateToBlock}
            />
          ),
        };

      case 'micro-learning':
        return {
          id: config.id,
          label: config.label,
          component: (
            <List
              chapterId={chapterId}
              tab={LEFT_TAB_NAMES.MICRO_LEARNING}
              changePageById={changePageById}
              navigateToBlock={navigateToBlock}
            />
          ),
        };

      case 'enriching-content':
        return {
          id: config.id,
          label: config.label,
          component: (
            <List
              chapterId={chapterId}
              tab={LEFT_TAB_NAMES.ENRICHING_CONTENT}
              changePageById={changePageById}
              navigateToBlock={navigateToBlock}
            />
          ),
        };

      case 'check-yourself-left':
        return {
          id: config.id,
          label: config.label,
          component: (
            <List
              chapterId={chapterId}
              tab={LEFT_TAB_NAMES.CHECK_YOURSELF}
              changePageById={changePageById}
              navigateToBlock={navigateToBlock}
            />
          ),
        };

      case 'exercise-left':
        return {
          id: config.id,
          label: config.label,
          component: <ExerciseTab chapterId={chapterId} />,
        };

      default:
        console.warn(`Unknown left tab ID: ${config.id}`);
        return null;
    }
  }).filter(Boolean); // Remove nulls
};

export const buildRightColumns = ({
  areasProperties,
  setAreasProperties,
  activePageIndex,
  onEditText,
  onClickDeleteArea,
  type,
  onClickSubmit,
  loadingSubmit,
  updateAreaProperty,
  updateAreaPropertyById,
  types,
  onChangeLabel,
  subObject,
  tOfActiveType,
  onSubmitAutoGenerate,
  loadingAutoGenerate,
  onClickToggleVirutalBlocks,
  showVB,
  compositeBlocks,
  compositeBlocksTypes,
  onChangeCompositeBlocks,
  processCompositeBlock,
  onSubmitCompositeBlocks,
  loadingSubmitCompositeBlocks,
  DeleteCompositeBlocks,
  highlight,
  setHighlight,
  chapterId,
  pages,
  setActivePageIndex,
  changePageById,
  getBlockFromBlockId,
  hightBlock,
  changePageByIndex,
  onClickHand,
}) => {
  // Create navigation function that combines page change and highlighting
  const navigateToBlock = (pageId, blockId) => {
    if (changePageById) changePageById(pageId);
    if (getBlockFromBlockId) getBlockFromBlockId(blockId);
    if (hightBlock) hightBlock(blockId);
  };

  // Get filtered tabs for studio mode
  const tabConfigs = getTabsForSidebar('right', 'studio');

  // Map tab configs to column objects
  return tabConfigs.map(config => {
    switch (config.id) {
      case 'table-of-contents':
        return {
          id: config.id,
          label: config.label,
          component: (
            <TableOfContents
              pages={pages}
              chapterId={chapterId}
              onChangeActivePage={(newPage) => {
                const newIndex = pages.findIndex((p) => p._id === newPage._id);
                if (newIndex !== -1 && changePageByIndex) {
                  changePageByIndex(newIndex);
                }
              }}
            />
          ),
        };

      case 'glossary-keywords':
        return {
          id: config.id,
          label: config.label,
          component: (
            <List
              chapterId={chapterId}
              tab={RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS}
              changePageById={changePageById}
              getBlockFromBlockId={getBlockFromBlockId}
              hightBlock={hightBlock}
              navigateToBlock={navigateToBlock}
            />
          ),
        };

      case 'illustrative-interactions':
        return {
          id: config.id,
          label: config.label,
          component: (
            <List
              chapterId={chapterId}
              tab={RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS}
              changePageById={changePageById}
              navigateToBlock={navigateToBlock}
            />
          ),
        };

      case 'block-authoring':
        return {
          id: config.id,
          label: config.label,
          component: (
            <StudioActions
              areasProperties={areasProperties}
              setAreasProperties={setAreasProperties}
              activePage={activePageIndex}
              onEditText={onEditText}
              onClickDeleteArea={onClickDeleteArea}
              type={type}
              onClickSubmit={onClickSubmit}
              loadingSubmit={loadingSubmit}
              updateAreaProperty={updateAreaProperty}
              updateAreaPropertyById={updateAreaPropertyById}
              types={types}
              onChangeLabel={onChangeLabel}
              subObject={subObject}
              tOfActiveType={tOfActiveType}
              onSubmitAutoGenerate={onSubmitAutoGenerate}
              loadingAutoGenerate={loadingAutoGenerate}
              onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
              showVB={showVB}
            />
          ),
        };

      case 'composite-blocks':
        return {
          id: config.id,
          label: config.label,
          component: (
            <StudioCompositeBlocks
              compositeBlocks={compositeBlocks}
              compositeBlocksTypes={compositeBlocksTypes}
              onChangeCompositeBlocks={onChangeCompositeBlocks}
              processCompositeBlock={processCompositeBlock}
              onSubmitCompositeBlocks={onSubmitCompositeBlocks}
              loadingSubmitCompositeBlocks={loadingSubmitCompositeBlocks}
              DeleteCompositeBlocks={DeleteCompositeBlocks}
              highlight={highlight}
              setHighlight={setHighlight}
              onClickHand={onClickHand}
            />
          ),
        };

      default:
        console.warn(`Unknown right tab ID: ${config.id}`);
        return null;
    }
  }).filter(Boolean); // Remove nulls
};

// Export Reader builders
export {
  buildReaderLeftColumns,
  buildReaderRightColumns,
} from "./reader.columns";
