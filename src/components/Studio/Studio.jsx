import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Alert } from "@mui/material";
import { colors } from "../../constants/highlight-color";
import { parseVirtualBlocksFromPages } from "../../utils/virtual-blocks";
import {
  ARABIC,
  ENGLISH,
  COMPLEX_TYPES,
  extractImage,
  getTypeOfLabel,
  getTypeOfLabel2,
  ocr,
} from "../../utils/ocr";
import { addPropsToAreasForCompositeBlocks } from "../../utils/studio";
import { useAppMode } from "../../utils/tabFiltering";
import {
  buildLeftColumns,
  buildRightColumns,
  buildReaderLeftColumns,
  buildReaderRightColumns,
} from "./columns";

import {
  RIGHT_TAB_NAMES,
  TIMEOUTS,
  DEFAULTS,
  LANGUAGE_CODES,
} from "./constants";

import StudioEditor from "./StudioEditor/StudioEditor";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";
import StudioStickyToolbar from "./StudioStickyToolbar/StudioStickyToolbar";
import BookColumn from "../Book/BookColumn/BookColumn";
import { useStore } from "../../store/store";

import styles from "./studio.module.scss";
import usePageManagement from "./hooks/usePageNavigation";
import useAreaManagement from "./hooks/useAreaManagement";
import useCompositeBlocks from "./hooks/useCompositeBlocks";
import useStudioActions from "./hooks/useStudioActions";
import useVirtualBlocks from "./hooks/useVirtualBlocks";
import useStudioState from "./hooks/useStudioState";

const Studio = (props) => {
  const {
    pages,
    type,
    subObject,
    handleClose,
    types,
    handleSubmit,
    language: lang,
    typeOfActiveType: tOfActiveType,
    onSubmitAutoGenerate,
    loadingAutoGenerate,
    refetch,
    compositeBlocksTypes,
  } = props;

  const {
    activePageIndex,
    setActivePageIndex,
    activePageId,
    changePageByIndex,
    changePageById,
  } = usePageManagement({
    pages,
    subObject,
  });

  const studioEditorRef = React.useRef(null);
  const canvasRef = React.createRef();

  const [virtualBlocks, setVirtualBlocks] = React.useState(
    subObject ? [] : parseVirtualBlocksFromPages(pages)
  );

  // const studioState =
  //   useStudioState({ areas, setAreas, areasProperties, setAreasProperties });

  const {
    areas,
    setAreas,
    areasProperties,
    setAreasProperties,
    getBlockFromBlockId,
    recalculateAreas,
    updateAreaProperty,
    onClickDeleteArea,
    updateAreaPropertyById,
    onEditText,
    syncAreasProperties,
    onChangeArea,
    onClickSubmit,
  } = useAreaManagement({
    pages,
    activePageIndex,
    types,
    studioEditorRef,
    subObject,
    type,
    handleSubmit,
    updateAreaPropertyForParent: props.updateAreaProperty,
    activePageId,
    virtualBlocks,
    refetch,
  });

  const { showVB, setShowVB, onClickToggleVirutalBlocks } = useVirtualBlocks({
    virtualBlocks,
    setVirtualBlocks,
    pages,
    subObject,
    recalculateAreas,
  });

  const [language, setLanguage] = React.useState(
    lang === LANGUAGE_CODES.ENGLISH ? ENGLISH : ARABIC
  );
  const { bookId, chapterId } = useParams();
  const location = useLocation();

  // Detect mode from URL (reader vs studio)
  const mode = useAppMode();
  const isReaderMode = mode === 'reader';

  // Debug: Log mode detection
  React.useEffect(() => {
    console.log('📍 Studio Mode Detection:', {
      mode,
      isReaderMode,
      pathname: location.pathname,
      url: window.location.href,
    });
  }, [mode, isReaderMode, location.pathname]);

  const { openModal } = useStore();

  const {
    compositeBlocks,
    setCompositeBlocks,
    loadingSubmitCompositeBlocks,
    onChangeCompositeBlocks,
    DeleteCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    onChangeCompositeBlockArea,
    onClickHand,
  } = useCompositeBlocks({
    canvasRef,
    studioEditorRef,
    language,
    chapterId,
    openModal,
    pages,
    areasProperties,
  });

  const { highlight, setHighlight, highlightedBlockId, hightBlock } =
    useStudioActions({
      getBlockFromBlockId,
    });

  const [showStickyToolbar, setShowStickyToolbar] = React.useState(false);

  const thumbnailsRef = React.useRef(null);

  const [colorIndex, setColorIndex] = React.useState(
    Array(pages?.length || 1).fill(0)
  );

  const [imageScaleFactor, setImageScaleFactor] = React.useState(
    DEFAULTS.IMAGE_SCALE_FACTOR
  );
  // To Extract Sub Object
  const [activeType, setActiveType] = React.useState("");
  const [typeOfActiveType, setTypeOfActiveType] = React.useState("");

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the target is NOT visible → show sticky content
        setShowStickyToolbar(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    const imageActionsRef = studioEditorRef.current?.imageActionsRef;
    if (imageActionsRef.current) {
      observer.observe(imageActionsRef.current);
    }

    return () => {
      if (imageActionsRef.current) {
        observer.unobserve(imageActionsRef.current);
      }
    };
  }, []);

  // Recalculate areas when image scale factor changes
  React.useEffect(() => {
    if (imageScaleFactor) {
      // Reset _updated flag for active page to force reconversion on zoom
      setAreas((prevState) => {
        const newAreas = [...prevState];
        if (newAreas[activePageIndex]) {
          newAreas[activePageIndex] = newAreas[activePageIndex].map((area) => ({
            ...area,
            _updated: false,
          }));
        }
        return newAreas;
      });

      // Delay to ensure state is updated before recalculation
      setTimeout(() => {
        recalculateAreas();
      }, TIMEOUTS.IMAGE_LOAD_DELAY);
    }
  }, [imageScaleFactor]);

  const onChangeHandler = (areasParam) => {
    if (activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS.label) {
      onChangeCompositeBlockArea(areasParam);
    } else {
      onChangeArea(areasParam);
    }
  };

  const onChangeLabel = async (id, label) => {
    syncAreasProperties();
    const idx = areasProperties[activePageIndex].findIndex(
      (area) => area.id === id
    );
    let area = {
      color: colors[colorIndex[activePageIndex] % colors.length],
    };
    setColorIndex((prevState) => {
      prevState[activePageIndex]++;
      return prevState;
    });
    let typeOfLabel = "";
    if (subObject) {
      typeOfLabel = getTypeOfLabel2(types, tOfActiveType, label);
    } else {
      typeOfLabel = getTypeOfLabel(
        types,
        areasProperties[activePageIndex][idx].type,
        label
      );
    }
    const img = extractImage(
      canvasRef,
      studioEditorRef.current.studioEditorSelectorRef,
      areasProperties,
      activePageIndex,
      areas,
      id
    );
    area = { ...area, label, typeOfLabel: typeOfLabel, image: img };

    updateAreaProperty(idx, area);
    if (typeOfLabel === "text" || typeOfLabel === "number") {
      updateAreaProperty(idx, { loading: true });
      const text = await ocr(language, img);
      updateAreaProperty(idx, { text, loading: false });
    } else if (typeOfLabel === "Coordinate") {
      const { naturalHeight, naturalWidth } =
        studioEditorRef.current.studioEditorSelectorRef.current;
      const x = Number.parseInt(
        (areas[activePageIndex][idx].x * naturalWidth) / 100
      );
      const y = Number.parseInt(
        (areas[activePageIndex][idx].y * naturalHeight) / 100
      );
      const text = `x= ${x}; y=${y};`;
      updateAreaProperty(idx, {
        text: text,
      });
    } else {
      // open modal if it has a supported type
      let found = COMPLEX_TYPES.find((type) => type === typeOfLabel);
      if (found) {
        setActiveType(label);
        setTypeOfActiveType(typeOfLabel);
        openModal("sub-object", {
          image: img,
          type: typeOfLabel,
          types: types,
          updateAreaProperty: updateAreaProperty,
          typeOfActiveType: typeOfLabel,
        });
      }
    }
  };

  // Create navigation function for reader mode
  const navigateToBlock = (pageId, blockId) => {
    if (changePageById) changePageById(pageId);
    if (getBlockFromBlockId) getBlockFromBlockId(blockId);
    if (hightBlock) hightBlock(blockId);
  };

  // Build columns based on mode
  const LEFT_COLUMNS = isReaderMode
    ? buildReaderLeftColumns({
        pages,
        activePage: pages?.[activePageIndex],
        setActivePage: (page) => {
          const newIndex = pages.findIndex((p) => p._id === page._id);
          if (newIndex !== -1) changePageByIndex(newIndex);
        },
        onChangeActivePage: (page) => {
          const newIndex = pages.findIndex((p) => p._id === page._id);
          if (newIndex !== -1) changePageByIndex(newIndex);
        },
        changePageById,
        navigateToBlock,
        chapterId,
        thumbnailsRef,
      })
    : buildLeftColumns({
        pages,
        chapterId,
        activePageIndex,
        changePageByIndex,
        thumbnailsRef,
        changePageById,
        getBlockFromBlockId,
        hightBlock,
      });

  const RIGHT_COLUMNS = isReaderMode
    ? buildReaderRightColumns({
        pages,
        setActivePage: (page) => {
          const newIndex = pages.findIndex((p) => p._id === page._id);
          if (newIndex !== -1) changePageByIndex(newIndex);
        },
        onChangeActivePage: (page) => {
          const newIndex = pages.findIndex((p) => p._id === page._id);
          if (newIndex !== -1) changePageByIndex(newIndex);
        },
        changePageById,
        navigateToBlock,
        chapterId,
      })
    : buildRightColumns({
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
      });

  const [activeLeftTab, setActiveLeftTab] = React.useState(LEFT_COLUMNS[0]);
  const [activeRightTab, setActiveRightTab] = React.useState(RIGHT_COLUMNS[0]);

  if (!pages.length) {
    return <Alert severity="error">No pages available.</Alert>;
  }

  return (
    <>
      <StudioStickyToolbar
        show={showStickyToolbar}
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        activePage={activePageIndex}
        areasProperties={areasProperties}
        showVB={showVB}
        onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
        onImageLoad={recalculateAreas}
        pages={pages}
        onClickImage={changePageByIndex}
      />
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
      <div className={styles.studio}>
        <BookColumn
          COLUMNS={LEFT_COLUMNS}
          activeColumn={LEFT_COLUMNS[0]}
          onImageLoad={recalculateAreas}
          activeTab={activeLeftTab}
          setActiveTab={setActiveLeftTab}
        />
        <StudioEditor
          areasProperties={areasProperties}
          setAreasProperties={setAreasProperties}
          activePage={activePageIndex}
          imageScaleFactor={imageScaleFactor}
          setImageScaleFactor={setImageScaleFactor}
          areas={areas}
          setAreas={setAreas}
          onChangeHandler={onChangeHandler}
          pages={pages}
          ref={studioEditorRef}
          onImageLoad={recalculateAreas}
          virtualBlocks={virtualBlocks[activePageIndex]}
          setVirtualBlocks={(value) =>
            setVirtualBlocks((prevState) => {
              prevState[activePageIndex] = value;
              return [...prevState];
            })
          }
          showVB={showVB}
          onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
          onClickImage={changePageByIndex}
          activeRightTab={activeRightTab}
          compositeBlocksTypes={compositeBlocksTypes}
          compositeBlocks={compositeBlocks}
          setCompositeBlocks={setCompositeBlocks}
          highlight={highlight}
          setHighlight={setHighlight}
          highlightedBlockId={highlightedBlockId}
        />
        <BookColumn
          COLUMNS={RIGHT_COLUMNS}
          activeColumn={RIGHT_COLUMNS[0]}
          onImageLoad={recalculateAreas}
          activeTab={activeRightTab}
          setActiveTab={setActiveRightTab}
        />
      </div>
      <div>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    </>
  );
};

export default Studio;
