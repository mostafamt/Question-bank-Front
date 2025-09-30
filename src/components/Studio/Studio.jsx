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

import StudioActions from "./StudioActions/StudioActions";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";
import StudioModals from "./StudioModals/StudioModals";
import { LEFT_POSITION } from "../../utils/book";
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

const RECALLS = "Recalls";
const MICRO_LEARNING = "Micro Learning";
const ENRICHING_CONTENT = "Enriching Content";
const CHECK_YOURSELF = "Check Yourself";
const ILLUSTRATIVE_INTERACTIONS = "Illustrative Interactions";

const tabNames = [
  RECALLS,
  MICRO_LEARNING,
  ENRICHING_CONTENT,
  CHECK_YOURSELF,
  ILLUSTRATIVE_INTERACTIONS,
];

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
      : localStorage.getItem("author_page")
      ? Number.parseInt(localStorage.getItem("author_page"))
      : 0
  );
  const activePageId = pages?.[activePageIndex]?._id;

  const studioEditorRef = React.useRef(null);
  const [showStickyToolbar, setShowStickyToolbar] = React.useState(false);
  const [showVB, setShowVB] = React.useState(false);
  const { bookId, chapterId } = useParams();
  const [compositeBlocks, setCompositeBlocks] = React.useState({
    name: "",
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
    }, 20);
  };

  const canvasRef = React.createRef();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  // To Extract Sub Object
  const [modalState, setModalState] = React.useState({
    open: false,
    source: null,
  });
  const [activeType, setActiveType] = React.useState("");
  const [typeOfActiveType, setTypeOfActiveType] = React.useState("");
  const [activeImage, setActiveImage] = React.useState("");

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const [modalName, setModalName] = React.useState("");
  const [workingArea, setWorkingArea] = React.useState();
  const [language, setLanguage] = React.useState(
    lang === "en" ? ENGLISH : ARABIC
  );

  const [checkedObjects, setCheckedObjects] = React.useState(
    tabNames.map((e) => ({
      label: e,
      objects: [],
    }))
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
    localStorage.setItem("author_page", `${idx}`);

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

  const handleCloseModal = () => {
    setModalState({
      open: false,
      source: null,
    });
  };

  const openModal = (source = null) => {
    console.log("source= ", source);
    setModalState({
      open: true,
      source: source,
    });
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

  const LEFT_COLUMNS = [
    {
      id: uuidv4(),
      label: "Thumbnails",
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
      label: RECALLS,
      component: (
        <List
          openModal={() => openModal(RECALLS)}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
          chapterId={chapterId}
          tabName={RECALLS}
        />
      ),
    },
    {
      id: uuidv4(),
      label: MICRO_LEARNING,
      component: (
        <List
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
          chapterId={chapterId}
          tabName={MICRO_LEARNING}
        />
      ),
    },
    {
      id: uuidv4(),
      label: ENRICHING_CONTENT,
      component: (
        <List
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
          chapterId={chapterId}
          tabName={ENRICHING_CONTENT}
        />
      ),
    },
    {
      id: uuidv4(),
      label: CHECK_YOURSELF,
      component: (
        <List
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
          chapterId={chapterId}
          tabName={CHECK_YOURSELF}
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
          processCompositeBlock={processCompositeBlock}
          onSubmitCompositeBlocks={onSubmitCompositeBlocks}
          loadingSubmitCompositeBlocks={loadingSubmitCompositeBlocks}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Table Of Contents",
      component: (
        <TableOfContents
          pages={pages}
          chapterId={chapterId}
          onChangeActivePage={(newPage) => {
            const newIndex = pages.findIndex((p) => p._id === newPage._id);
            if (newIndex !== -1) {
              setActivePageIndex(newIndex);
              localStorage.setItem("author_page", `${newIndex}`);
            }
          }}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Glossary & keywords",
      component: <GlossaryAndKeywords chapterId={chapterId} />,
    },
    {
      id: uuidv4(),
      label: ILLUSTRATIVE_INTERACTIONS,
      component: (
        <List
          openModal={openModal}
          setModalName={setModalName}
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
          setWorkingArea={setWorkingArea}
          chapterId={chapterId}
          tabName={ILLUSTRATIVE_INTERACTIONS}
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
        modalState={modalState}
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
        tabName={""}
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
