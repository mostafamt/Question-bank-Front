// studio.columns.js
import { v4 as uuidv4 } from "uuid";
import StudioThumbnails from "../StudioThumbnails/StudioThumbnails";
import List from "../../Tabs/List/List";
import TableOfContents from "../../Book/TableOfContents/TableOfContents";
import GlossaryAndKeywords from "../../Tabs/GlossaryAndKeywords/GlossaryAndKeywords";
import StudioCompositeBlocks from "../StudioCompositeBlocks/StudioCompositeBlocks";
import StudioActions from "../StudioActions/StudioActions";
import { LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../constants";

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

  return [
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.THUMBNAILS,
      component: (
        <StudioThumbnails
          pages={pages}
          activePage={activePageIndex}
          onClickImage={changePageByIndex}
          ref={thumbnailsRef}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.RECALLS,
      component: (
        <List
          chapterId={chapterId}
          tabName={LEFT_TAB_NAMES.RECALLS}
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.MICRO_LEARNING,
      component: (
        <List
          chapterId={chapterId}
          tabName={LEFT_TAB_NAMES.MICRO_LEARNING}
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.ENRICHING_CONTENT,
      component: (
        <List
          chapterId={chapterId}
          tabName={LEFT_TAB_NAMES.ENRICHING_CONTENT}
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.CHECK_YOURSELF,
      component: (
        <List
          chapterId={chapterId}
          tabName={LEFT_TAB_NAMES.CHECK_YOURSELF}
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
  ];
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
}) => {
  // Create navigation function that combines page change and highlighting
  const navigateToBlock = (pageId, blockId) => {
    if (changePageById) changePageById(pageId);
    if (getBlockFromBlockId) getBlockFromBlockId(blockId);
    if (hightBlock) hightBlock(blockId);
  };

  const actionsComponent = (
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
  );

  return [
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.BLOCK_AUTHORING,
      component: actionsComponent,
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.COMPOSITE_BLOCKS,
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
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.TABLE_OF_CONTENTS,
      component: (
        <TableOfContents
          pages={pages}
          chapterId={chapterId}
          onChangeActivePage={(newPage) => {
            const newIndex = pages.findIndex((p) => p._id === newPage._id);
            if (newIndex !== -1) setActivePageIndex(newIndex);
          }}
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS,
      component: (
        <GlossaryAndKeywords
          chapterId={chapterId}
          changePageById={changePageById}
          getBlockFromBlockId={getBlockFromBlockId}
          hightBlock={hightBlock}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS,
      component: (
        <List
          chapterId={chapterId}
          tabName={RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS}
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
  ];
};
