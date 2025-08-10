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
  deleteAreaByIndex,
  extractImage,
  getTypeNameOfLabelKey,
  getTypeOfLabel,
  getTypeOfLabel2,
  ocr,
  onEditTextField,
  updateAreasProperties,
} from "../../utils/ocr";

import StudioActions from "./StudioActions/StudioActions";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";
import StudioModals from "./StudioModals/StudioModals";
import { LEFT_POSITION } from "../../utils/book";
import BookColumn from "../Book/BookColumn/BookColumn";
import {
  GlossaryAndKeywordsData,
  checkYourselfData,
  enrichingContentData,
  illustrativeInteractionsData,
  microLearningData,
  recallsData,
  tableOfContentsData,
} from "../../utils/tabs";
import List from "../Tabs/List/List";
import { parseVirtualBlocksFromPages } from "../../utils/virtual-blocks";
import StudioStickyToolbar from "./StudioStickyToolbar/StudioStickyToolbar";
import StudioCompositeBlocks from "./StudioCompositeBlocks/StudioCompositeBlocks";
import { addPropsToAreasForCompositeBlocks } from "../../utils/studio";

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
      ? 0
      : localStorage.getItem("_page")
      ? Number.parseInt(localStorage.getItem("_page"))
      : 0
  );
  const activePageId = pages?.[activePageIndex]?._id;

  const studioEditorRef = React.useRef(null);
  const [showStickyToolbar, setShowStickyToolbar] = React.useState(false);
  const [showVB, setShowVB] = React.useState(false);
  const [compositeBlocksAreas, setCompositeBlocksAreas] = React.useState([]);
  const [compositeBlocks, setCompositeBlocks] = React.useState({
    name: "",
    type: "",
    areas: [],
  });
  const [_compositeBlocks, _setCompositeBlocks] = React.useState({
    name: "",
    type: "",
    areas: [],
  });

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
    }, 20);
  };

  const canvasRef = React.createRef();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  // To Extract Sub Object
  const [showModal, setShowModal] = React.useState(false);
  const [activeType, setActiveType] = React.useState("");
  const [typeOfActiveType, setTypeOfActiveType] = React.useState("");
  const [activeImage, setActiveImage] = React.useState("");

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const [modalName, setModalName] = React.useState("");
  const [workingArea, setWorkingArea] = React.useState();
  const [language, setLanguage] = React.useState(
    lang === "en" ? ENGLISH : ARABIC
  );

  const [checkedObjects, setCheckedObjects] = React.useState([]);
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

  const onImageLoad = () => {
    setAreas((prevState) => {
      return prevState?.map((page, idx1) => {
        return page?.map((block, idx2) => {
          if (block._unit === "percentage") {
            const { clientHeight, clientWidth } =
              studioEditorRef.current.studioEditorSelectorRef.current;

            const properties = areasProperties[idx1][idx2];

            return {
              x: (properties.x / 100) * clientWidth,
              y: (properties.y / 100) * clientHeight,
              width: (properties.width / 100) * clientWidth,
              height: (properties.height / 100) * clientHeight,
              unit: "px",
              isChanging: true,
              isNew: true,
              _updated: true,
              _unit: block._unit,
            };
          }

          return {
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
            unit: "px",
            isChanging: true,
            isNew: true,
          };
        });
      });
    });
  };

  const onClickImage = (idx) => {
    setActivePageIndex(idx);
    localStorage.setItem("_page", `${idx}`);
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
    if (activeRightTab.label === "Composite Blocks") {
      const compositeBlocksWithPropsAreas = addPropsToAreasForCompositeBlocks(
        compositeBlocks,
        areasParam
      );

      setCompositeBlocks(compositeBlocksWithPropsAreas);
    } else {
      if (areasParam.length > areasProperties[activePageIndex].length) {
        syncAreasProperties();
      }

      const newAreasParam = [...areas];
      newAreasParam[activePageIndex] = areasParam;
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

  const handleCloseModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

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
    setActiveImage(img);
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
        setModalName("");
        setWorkingArea(area);
        setActiveType(label);
        setTypeOfActiveType(typeOfLabel);
        setTimeout(() => {
          openModal();
        }, 1000);
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

  const LEFT_COLUMNS = [
    {
      id: uuidv4(),
      label: "Thumbnails",
      component: (
        <StudioThumbnails
          pages={pages}
          activePage={activePageIndex}
          onClickImage={onClickImage}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Recalls",
      component: (
        <List
          data={illustrativeInteractionsData}
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Micro Learning",
      component: (
        <List
          data={illustrativeInteractionsData}
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Enriching Contents",
      component: (
        <List
          data={illustrativeInteractionsData}
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Check Yourself",
      component: (
        <List
          data={illustrativeInteractionsData}
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
        />
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
      setModalName={setModalName}
      openModal={openModal}
      setWorkingArea={setWorkingArea}
      tOfActiveType={tOfActiveType}
      onSubmitAutoGenerate={onSubmitAutoGenerate}
      loadingAutoGenerate={loadingAutoGenerate}
    />
  );

  let RIGHT_COLUMNS = [
    {
      id: uuidv4(),
      label: "Block Authoring",
      component: StudioActionsComponent,
    },
    {
      id: uuidv4(),
      label: "Composite Blocks",
      component: (
        <StudioCompositeBlocks
          compositeBlocks={compositeBlocks}
          compositeBlocksTypes={compositeBlocksTypes}
          onChangeCompositeBlocks={onChangeCompositeBlocks}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Table Of Contents",
      component: <List data={tableOfContentsData} />,
    },
    {
      id: uuidv4(),
      label: "Glossary & keywords",
      component: <List data={GlossaryAndKeywordsData} />,
    },
    {
      id: uuidv4(),
      label: "Illustrative Interactions",
      component: (
        <List
          data={illustrativeInteractionsData}
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
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
      <StudioModals
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        activeImage={activeImage}
        activeType={activeType}
        typeOfActiveType={typeOfActiveType}
        types={types}
        updateAreaProperty={updateAreaProperty}
        modalName={modalName}
        workingArea={workingArea}
        updateAreaPropertyById={updateAreaPropertyById}
        checkedObjects={checkedObjects}
        setCheckedObjects={setCheckedObjects}
        virtualBlocks={virtualBlocks[activePageIndex]}
        setVirtualBlocks={(value) =>
          setVirtualBlocks((prevState) => {
            prevState[activePageIndex] = value;
            return [...prevState];
          })
        }
      />
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
          openModal={openModal}
          setModalName={setModalName}
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
          compositeBlocks={compositeBlocks}
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
