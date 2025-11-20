import React from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Alert } from "@mui/material";

import { colors } from "../../constants/highlight-color";
import { parseVirtualBlocksFromPages } from "../../utils/virtual-blocks";
import {
  ARABIC,
  ENGLISH,
  COMPLEX_TYPES,
  DELETED,
  cropSelectedArea,
  deleteAreaByIndex,
  extractImage,
  getTypeOfLabel,
  getTypeOfLabel2,
  ocr,
  onEditTextField,
  updateAreasProperties,
} from "../../utils/ocr";
import { addPropsToAreasForCompositeBlocks } from "../../utils/studio";

import { processAreasForImageLoad } from "./services/coordinate.service";
import { buildLeftColumns, buildRightColumns } from "./columns";

import {
  RIGHT_TAB_NAMES,
  TIMEOUTS,
  STORAGE_KEYS,
  DEFAULTS,
  LANGUAGE_CODES,
} from "./constants";

import {
  initAreas,
  initAreasProperties,
  initCompositeBlocks,
} from "./initializers";

import StudioEditor from "./StudioEditor/StudioEditor";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";
import StudioStickyToolbar from "./StudioStickyToolbar/StudioStickyToolbar";
import BookColumn from "../Book/BookColumn/BookColumn";
import { saveCompositeBlocks } from "../../services/api";
import { useStore } from "../../store/store";

import styles from "./studio.module.scss";

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

  const [activePageIndex, setActivePageIndex] = React.useState(
    subObject
      ? DEFAULTS.ACTIVE_PAGE_INDEX
      : localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE)
      ? Number.parseInt(localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE))
      : DEFAULTS.ACTIVE_PAGE_INDEX
  );
  const activePageId = pages?.[activePageIndex]?._id;

  const { openModal } = useStore();

  const studioEditorRef = React.useRef(null);
  const [showStickyToolbar, setShowStickyToolbar] = React.useState(false);
  const [showVB, setShowVB] = React.useState(false);
  const { bookId, chapterId } = useParams();
  const [compositeBlocks, setCompositeBlocks] =
    React.useState(initCompositeBlocks);
  const [highlight, setHighlight] = React.useState("");
  const [loadingSubmitCompositeBlocks, setLoadingSubmitCompositeBlocks] =
    React.useState(false);
  const thumbnailsRef = React.useRef(null);

  const [areas, setAreas] = React.useState(() => initAreas(pages));

  const [areasProperties, setAreasProperties] = React.useState(() =>
    initAreasProperties(pages, types)
  );

  const [colorIndex, setColorIndex] = React.useState(
    Array(pages?.length || 1).fill(0)
  );

  const onClickToggleVirutalBlocks = () => {
    setShowVB((prevState) => !prevState);
    setTimeout(() => {
      onImageLoad();
    }, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
  };

  const canvasRef = React.createRef();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(
    DEFAULTS.IMAGE_SCALE_FACTOR
  );
  // To Extract Sub Object
  const [activeType, setActiveType] = React.useState("");
  const [typeOfActiveType, setTypeOfActiveType] = React.useState("");
  const [highlightedBlockId, setHighlightedBlockId] = React.useState(null);

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const [language, setLanguage] = React.useState(
    lang === LANGUAGE_CODES.ENGLISH ? ENGLISH : ARABIC
  );
  const [virtualBlocks, setVirtualBlocks] = React.useState(
    subObject ? [] : parseVirtualBlocksFromPages(pages)
  );

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
        onImageLoad();
      }, TIMEOUTS.IMAGE_LOAD_DELAY);
    }
  }, [imageScaleFactor]);

  /**
   * Recalculates area pixel coordinates based on the currently loaded image's dimensions.
   *
   * This function is triggered when:
   * - An image finishes loading (via onLoad event)
   * - The user zooms in/out (imageScaleFactor changes) - image scales
   * - The user navigates to a different page - new image loads
   * - Virtual blocks are toggled on/off - layout changes
   *
   * Why this is needed:
   * Areas are stored with percentage coordinates to be resolution-independent.
   * When the image loads or its size changes, we need to recalculate the pixel
   * positions based on the image's current rendered size. This ensures areas
   * stay properly aligned with the image content at any zoom level.
   *
   * The recalculation logic is delegated to the coordinate service layer which:
   * 1. Validates the image is fully loaded
   * 2. Extracts current dimensions from the DOM element
   * 3. Converts percentage coordinates to pixels
   * 4. Preserves metadata for future recalculations
   */
  const onImageLoad = () => {
    setAreas((prevState) => {
      const processedAreas = processAreasForImageLoad(
        prevState,
        areasProperties,
        studioEditorRef
      );

      // Return processed areas if successful, otherwise keep previous state
      return processedAreas || prevState;
    });
  };

  const getPageIndexFromPageId = (id) => {
    if (!pages || !pages.length) return 0;

    const index = pages.findIndex((p) => p._id === id);

    // If the page was not found → return the current active page index
    if (index === -1) {
      console.warn(`Page with id "${id}" not found in pages list`);
      return activePageIndex;
    }

    return index;
  };

  const changePageByIndex = (idx) => {
    setActivePageIndex(idx);
    localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${idx}`);
  };

  const changePageById = (id) => {
    const idx = getPageIndexFromPageId(id);
    changePageByIndex(idx);
  };

  const getBlockFromBlockId = (id) => {
    if (!id) return null;

    // Search inside areas for all pages
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const areaBlock = areasProperties[pageIndex]?.find((a) => {
        return a.id === id;
      });

      if (areaBlock) {
        return {
          ...areaBlock,
          pageIndex,
          type: "area",
        };
      }
    }

    console.warn(`Block with id "${id}" not found.`);
    return null;
  };

  const hightBlock = (id) => {
    if (!id) return;

    // 1) Find the block (we already have getBlockFromBlockId)
    const block = getBlockFromBlockId(id);
    if (!block) return;

    setHighlightedBlockId(id);
    // const { pageIndex } = block;

    // setAreasProperties((prev) => {
    //   const newProps = [...prev];
    //   newProps[pageIndex] = newProps[pageIndex].map((area) =>
    //     area.id === id ? { ...area, color: "#000" } : area
    //   );
    //   return newProps;
    // });
  };

  const syncAreasProperties = () => {
    const newAreasProperties = updateAreasProperties(
      areasProperties,
      activePageIndex,
      areas,
      subObject,
      type
    );
    setAreasProperties(newAreasProperties);
  };

  const onChangeHandler = (areasParam) => {
    if (activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS) {
      const compositeBlocksWithPropsAreas = addPropsToAreasForCompositeBlocks(
        compositeBlocks,
        areasParam
      );

      setCompositeBlocks(compositeBlocksWithPropsAreas);
    } else {
      if (areasParam.length > areasProperties[activePageIndex].length) {
        syncAreasProperties();
      }

      // Add metadata to new areas
      const areasWithMetadata = areasParam.map((area, idx) => {
        // Check if this is an existing area
        const existingArea = areas[activePageIndex]?.[idx];

        if (existingArea) {
          // Preserve metadata from existing area
          return {
            ...area,
            _unit: existingArea._unit || "percentage",
            _updated: existingArea._updated || false,
            // Preserve or store percentage coordinates
            _percentX: existingArea._percentX ?? area.x,
            _percentY: existingArea._percentY ?? area.y,
            _percentWidth: existingArea._percentWidth ?? area.width,
            _percentHeight: existingArea._percentHeight ?? area.height,
          };
        } else {
          // New area - set metadata (AreaSelector uses percentage)
          return {
            ...area,
            _unit: "percentage",
            _updated: false,
            // Store original percentage coordinates
            _percentX: area.x,
            _percentY: area.y,
            _percentWidth: area.width,
            _percentHeight: area.height,
          };
        }
      });

      const newAreasParam = [...areas];
      newAreasParam[activePageIndex] = areasWithMetadata;
      setAreas(newAreasParam);
    }
  };

  const onClickDeleteArea = (idx) => {
    const { isServer } = areasProperties[activePageIndex][idx];
    if (isServer) {
      updateAreaProperty(idx, { status: DELETED });
    } else {
      const newAreas = deleteAreaByIndex(areas, activePageIndex, idx);
      setAreas(newAreas);

      const newAreasProperties = deleteAreaByIndex(
        areasProperties,
        activePageIndex,
        idx
      );
      setAreasProperties(newAreasProperties);
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

  const onClickSubmit = async () => {
    setLoadingSubmit(true);
    if (subObject) {
      const id = await handleSubmit(areasProperties[activePageIndex]);
      props.updateAreaProperty(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      // handleClose();
    } else {
      const id = await handleSubmit(
        activePageId,
        areasProperties[activePageIndex],
        virtualBlocks[activePageIndex]
      );
      id && toast.success("Object created successfully!");
      refetch();
    }
    // clear();
    setLoadingSubmit(false);
  };

  const updateAreaProperty = (idx, property) => {
    setAreasProperties((prevState) => {
      let newTrialAreas = [...prevState];
      if (idx === -1) {
        const lastIndex = idx + areasProperties[activePageIndex].length;
        newTrialAreas[activePageIndex][lastIndex] = {
          ...newTrialAreas[activePageIndex][lastIndex],
          ...property,
        };
      } else {
        newTrialAreas[activePageIndex][idx] = {
          ...newTrialAreas[activePageIndex][idx],
          ...property,
        };
      }
      return newTrialAreas;
    });
  };

  const updateAreaPropertyById = (id, property) => {
    const newAreasProperties = [...areasProperties];
    newAreasProperties[activePageIndex] = newAreasProperties[
      activePageIndex
    ].map((area) => {
      if (area.id === id) {
        return {
          ...area,
          ...property,
        };
      }
      return area;
    });
    setAreasProperties(newAreasProperties);
  };

  const onEditText = (id, text) => {
    const newAreasProperties = onEditTextField(
      areasProperties,
      activePageIndex,
      id,
      text
    );
    setAreasProperties(newAreasProperties);
  };

  ///////////////////////////////////////////////////
  // Composite Blocks
  /////////////////////////////////////////////////
  const onChangeCompositeBlocks = (id, key, value) => {
    if (!id) {
      setCompositeBlocks((prevState) => ({
        ...prevState,
        [key]: value,
        areas: [],
      }));
      return;
    }

    setCompositeBlocks((prevState) => {
      return {
        ...prevState,
        areas: prevState?.areas?.map((item) => {
          if (item.id === id) {
            item = { ...item, [key]: value };
          }
          return item;
        }),
      };
    });
  };

  const DeleteCompositeBlocks = (id) => {
    setCompositeBlocks((prevState) => {
      const newAreas = prevState?.areas?.filter((item) => item.id !== id);
      return { ...prevState, areas: newAreas };
    });
  };

  const processCompositeBlock = async (id, typeOfLabel) => {
    setCompositeBlocks((prevState) => {
      const newAreas = prevState?.areas?.map((item) => {
        if (item.id === id) {
          item.loading = true;
        }
        return item;
      });
      return { ...prevState, areas: newAreas };
    });

    const { naturalWidth, clientWidth, clientHeight } =
      studioEditorRef.current.studioEditorSelectorRef.current;

    const ratio = naturalWidth / clientWidth;

    const selecedBlock = compositeBlocks.areas.find((item) => item.id === id);
    const x = ((selecedBlock.x * ratio) / 100) * clientWidth;
    const y = ((selecedBlock.y * ratio) / 100) * clientHeight;
    const width = ((selecedBlock.width * ratio) / 100) * clientWidth;
    const height = ((selecedBlock.height * ratio) / 100) * clientHeight;

    const img = cropSelectedArea(
      canvasRef,
      studioEditorRef.current.studioEditorSelectorRef,
      x,
      y,
      width,
      height
    );

    let text = "";
    if (typeOfLabel === "text") {
      text = await ocr(language, img);
    }

    setCompositeBlocks((prevState) => {
      const newAreas = prevState?.areas?.map((item) => {
        if (item.id === id) {
          item = {
            ...item,
            loading: false,
            img: img,
            text: text,
          };
        }
        return item;
      });
      return { ...prevState, areas: newAreas };
    });
  };

  const onSubmitCompositeBlocks = async () => {
    setLoadingSubmitCompositeBlocks(true);

    const blocks = compositeBlocks.areas.map(
      ({ type, text, x, y, width, height, unit }) => ({
        contentType: type,
        contentValue: text,
        coordinates: {
          height,
          unit: unit === "%" ? "percentage" : "px",
          width,
          x,
          y,
        },
      })
    );

    const data = {
      name: compositeBlocks.name,
      type: compositeBlocks.type,
      chapterId,
      blocks,
    };

    const id = await saveCompositeBlocks(data);

    setLoadingSubmitCompositeBlocks(false);
  };
  ///////////////////////////////////////////////////
  // End Of Composite Blocks
  /////////////////////////////////////////////////

  const LEFT_COLUMNS = buildLeftColumns({
    pages,
    chapterId,
    activePageIndex,
    changePageByIndex,
    thumbnailsRef,
  });

  const RIGHT_COLUMNS = buildRightColumns({
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
        onImageLoad={onImageLoad}
        pages={pages}
        onClickImage={changePageByIndex}
      />
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
      <div className={styles.studio}>
        <BookColumn
          COLUMNS={LEFT_COLUMNS}
          activeColumn={LEFT_COLUMNS[0]}
          onImageLoad={onImageLoad}
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
          onImageLoad={onImageLoad}
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
          onImageLoad={onImageLoad}
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
