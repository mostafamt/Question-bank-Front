import React from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { colors } from "../../constants/highlight-color";

import StudioThumbnails from "./StudioThumbnails/StudioThumbnails";
import StudioEditor from "./StudioEditor/StudioEditor";
import { Alert } from "@mui/material";
import {
  ARABIC,
  COMPLEX_TYPES,
  DELETED,
  ENGLISH,
  cropSelectedArea,
  deleteAreaByIndex,
  extractImage,
  getTypeNameOfLabelKey,
  getTypeOfLabel,
  getTypeOfLabel2,
  ocr,
  onEditTextField,
  updateAreasProperties,
} from "../../utils/ocr";
import {
  LEFT_TAB_NAMES,
  RIGHT_TAB_NAMES,
  TIMEOUTS,
  STORAGE_KEYS,
  DEFAULTS,
  OCR_LANGUAGES,
  LANGUAGE_CODES,
  COMPOSITE_BLOCK,
} from "./constants";

import StudioActions from "./StudioActions/StudioActions";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";
import BookColumn from "../Book/BookColumn/BookColumn";
import List from "../Tabs/List/List";
import { parseVirtualBlocksFromPages } from "../../utils/virtual-blocks";
import StudioStickyToolbar from "./StudioStickyToolbar/StudioStickyToolbar";
import StudioCompositeBlocks from "./StudioCompositeBlocks/StudioCompositeBlocks";
import { addPropsToAreasForCompositeBlocks } from "../../utils/studio";

import styles from "./studio.module.scss";
import { saveCompositeBlocks } from "../../services/api";
import { useParams } from "react-router-dom";
import TableOfContents from "../Book/TableOfContents/TableOfContents";
import GlossaryAndKeywords from "../Tabs/GlossaryAndKeywords/GlossaryAndKeywords";
import { useStore } from "../../store/store";

// Tab names now imported from constants/tabs.constants.js

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
  const [compositeBlocks, setCompositeBlocks] = React.useState({
    name: `${COMPOSITE_BLOCK.NAME_PREFIX} ${uuidv4().slice(
      0,
      COMPOSITE_BLOCK.UUID_SLICE_LENGTH
    )}`,
    type: "",
    areas: [],
  });
  const [highlight, setHighlight] = React.useState("");
  const [loadingSubmitCompositeBlocks, setLoadingSubmitCompositeBlocks] =
    React.useState(false);
  const thumbnailsRef = React.useRef(null);

  const [areas, setAreas] = React.useState(
    pages?.map((page) =>
      page.blocks?.map((block) => {
        return {
          x: block.coordinates.x,
          y: block.coordinates.y,
          width: block.coordinates.width,
          height: block.coordinates.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          _unit: block.coordinates.unit,
          _updated: false,
        };
      })
    ) || Array(pages?.length || 1).fill([])
  );

  const [areasProperties, setAreasProperties] = React.useState(
    pages?.map(
      (page) =>
        page.blocks?.map((block, idx) => {
          let typeName = getTypeNameOfLabelKey(types, block.contentType);
          return {
            x: block.coordinates.x,
            y: block.coordinates.y,
            width: block.coordinates.width,
            height: block.coordinates.height,
            id: uuidv4(),
            color: colors[idx % colors.length],
            loading: false,
            text: block.contentValue,
            image: block.contentValue,
            type: typeName,
            parameter: "",
            label: block.contentType,
            typeOfLabel: getTypeOfLabel(types, typeName, block.contentType),
            order: idx,
            open: false,
            isServer: "true",
            blockId: block.blockId,
          };
        }) || []
    ) || Array(pages?.length || 1).fill([])
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

  const onImageLoad = () => {
    setAreas((prevState) => {
      return prevState?.map((page, idx1) => {
        return page?.map((block, idx2) => {
          // Safety check: ensure ref exists
          if (!studioEditorRef.current?.studioEditorSelectorRef?.current) {
            return {
              ...block,
              _unit: block._unit || "px",
              _updated: block._updated || false,
              _percentX: block._percentX,
              _percentY: block._percentY,
              _percentWidth: block._percentWidth,
              _percentHeight: block._percentHeight,
            };
          }

          // Convert percentage to pixels only if not already updated
          if (block._unit === "percentage" && !block._updated) {
            const { clientHeight, clientWidth } =
              studioEditorRef.current.studioEditorSelectorRef.current;

            // Safety check: ensure valid dimensions
            if (!clientWidth || !clientHeight) {
              return {
                ...block,
                _unit: block._unit,
                _updated: false,
                _percentX: block._percentX,
                _percentY: block._percentY,
                _percentWidth: block._percentWidth,
                _percentHeight: block._percentHeight,
              };
            }

            // Use stored percentage coordinates or fall back to areasProperties
            let percentX, percentY, percentWidth, percentHeight;

            if (block._percentX !== undefined) {
              // Use stored percentage coordinates from the area itself
              percentX = block._percentX;
              percentY = block._percentY;
              percentWidth = block._percentWidth;
              percentHeight = block._percentHeight;
            } else {
              // Fall back to areasProperties for backward compatibility
              const properties = areasProperties[idx1]?.[idx2];
              if (!properties) {
                return {
                  ...block,
                  _unit: block._unit,
                  _updated: false,
                  _percentX: block._percentX,
                  _percentY: block._percentY,
                  _percentWidth: block._percentWidth,
                  _percentHeight: block._percentHeight,
                };
              }
              percentX = properties.x;
              percentY = properties.y;
              percentWidth = properties.width;
              percentHeight = properties.height;
            }

            return {
              x: (percentX / 100) * clientWidth,
              y: (percentY / 100) * clientHeight,
              width: (percentWidth / 100) * clientWidth,
              height: (percentHeight / 100) * clientHeight,
              unit: "px",
              isChanging: true,
              isNew: true,
              _updated: true,
              _unit: block._unit,
              // Preserve percentage coordinates
              _percentX: percentX,
              _percentY: percentY,
              _percentWidth: percentWidth,
              _percentHeight: percentHeight,
            };
          }

          // Preserve all metadata for non-percentage blocks
          return {
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
            unit: "px",
            isChanging: true,
            isNew: true,
            _unit: block._unit || "px",
            _updated: block._updated || false,
            // Preserve percentage coordinates if they exist
            _percentX: block._percentX,
            _percentY: block._percentY,
            _percentWidth: block._percentWidth,
            _percentHeight: block._percentHeight,
          };
        });
      });
    });
  };

  const onClickImage = (idx) => {
    setActivePageIndex(idx);
    localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${idx}`);

    // Reset _updated flag for the target page to force reconversion
    setAreas((prevState) => {
      const newAreas = [...prevState];
      if (newAreas[idx]) {
        newAreas[idx] = newAreas[idx].map((area) => ({
          ...area,
          _updated: false, // Reset to force reconversion
        }));
      }
      return newAreas;
    });

    // Force recalculation when changing pages
    setTimeout(() => {
      onImageLoad();
    }, TIMEOUTS.PAGE_NAVIGATION_DELAY);

    console.log("thumbnailsRef= ", thumbnailsRef);

    // if (thumbnailsRef.current) {
    //   const container = thumbnailsRef.current;
    //   const index = pages.findIndex((p) => p._id === newPage._id);

    //   if (index !== -1) {
    //     const btn = container.querySelector(`button:nth-child(${index + 1})`);
    //     if (btn) {
    //       const offset = container.clientHeight * 0.03; // 3% of container height

    //       container.scrollTo({
    //         top: btn.offsetTop - offset,
    //         behavior: "smooth",
    //       });
    //     }
    //   }
    // }
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
      handleClose();
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

  const LEFT_COLUMNS = [
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.THUMBNAILS,
      component: (
        <StudioThumbnails
          pages={pages}
          activePage={activePageIndex}
          onClickImage={onClickImage}
          ref={thumbnailsRef}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.RECALLS,
      component: (
        <List chapterId={chapterId} tabName={LEFT_TAB_NAMES.RECALLS} />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.MICRO_LEARNING,
      component: (
        <List chapterId={chapterId} tabName={LEFT_TAB_NAMES.MICRO_LEARNING} />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.ENRICHING_CONTENT,
      component: (
        <List
          chapterId={chapterId}
          tabName={LEFT_TAB_NAMES.ENRICHING_CONTENT}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.CHECK_YOURSELF,
      component: (
        <List chapterId={chapterId} tabName={LEFT_TAB_NAMES.CHECK_YOURSELF} />
      ),
    },
  ];

  const StudioActionsComponent = (
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

  let RIGHT_COLUMNS = [
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.BLOCK_AUTHORING,
      component: StudioActionsComponent,
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
            if (newIndex !== -1) {
              setActivePageIndex(newIndex);
              localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${newIndex}`);
            }
          }}
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS,
      component: <GlossaryAndKeywords chapterId={chapterId} />,
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS,
      component: (
        <List
          chapterId={chapterId}
          tabName={RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS}
        />
      ),
    },
  ];

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
        onClickImage={onClickImage}
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
          onClickImage={onClickImage}
          activeRightTab={activeRightTab}
          compositeBlocksTypes={compositeBlocksTypes}
          compositeBlocks={compositeBlocks}
          setCompositeBlocks={setCompositeBlocks}
          highlight={highlight}
          setHighlight={setHighlight}
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
