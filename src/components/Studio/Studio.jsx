import React from "react";
import { useStore } from "../../store/store";
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

import styles from "./studio.module.scss";
import StudioActions from "./StudioActions/StudioActions";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";
// import { debounce } from "lodash";
import _ from "lodash";
import StudioModals from "./StudioModals/StudioModals";
import BookColumn2 from "../Book/BookColumn2/BookColumn2";
import { LEFT_POSITION } from "../../utils/book";
import BookColumn from "../Book/BookColumn/BookColumn";

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
  } = props;
  const [activePage, setActivePage] = React.useState(0);
  const [areas, setAreas] = React.useState(
    pages?.map((page) =>
      page.blocks?.map((block) => ({
        x: block.coordinates.x,
        y: block.coordinates.y,
        width: block.coordinates.width,
        height: block.coordinates.height,
        unit: "px",
        isChanging: true,
        isNew: true,
      }))
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
  const imageRef = React.createRef();
  const canvasRef = React.createRef();
  const { data: state } = useStore();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  // To Extract Sub Object
  const [showModal, setShowModal] = React.useState(false);
  const [activeType, setActiveType] = React.useState("");
  const [typeOfActiveType, setTypeOfActiveType] = React.useState("");
  const [activeImage, setActiveImage] = React.useState("");
  const [pageId, setPageId] = React.useState(pages?.[0]?._id);
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const [modalName, setModalName] = React.useState("");
  const [workingArea, setWorkingArea] = React.useState();
  const [language, setLanguage] = React.useState(
    lang === "en" ? ENGLISH : ARABIC
  );

  const onClickImage = (idx) => {
    setActivePage(idx);
    setPageId(pages?.[idx]?._id);
  };

  const syncAreasProperties = () => {
    const newAreasProperties = updateAreasProperties(
      areasProperties,
      activePage,
      areas,
      subObject,
      type
    );
    setAreasProperties(newAreasProperties);
  };

  const functionDebounce = _.debounce(() => console.log("yo"), 300);

  const onChangeHandler = (areasParam) => {
    // syncAreasProperties();
    // debounce(() => syncAreasProperties(), 1000);
    // _.debounce(() => console.log("yo"), 300);
    if (areasParam.length > areasProperties[activePage].length) {
      syncAreasProperties();
    }

    const newAreasParam = [...areas];
    newAreasParam[activePage] = areasParam;
    setAreas(newAreasParam);
  };

  const onClickDeleteArea = (idx) => {
    const { isServer } = areasProperties[activePage][idx];
    if (isServer) {
      updateAreaProperty(idx, { status: DELETED });
    } else {
      const newAreas = deleteAreaByIndex(areas, activePage, idx);
      setAreas(newAreas);

      const newAreasProperties = deleteAreaByIndex(
        areasProperties,
        activePage,
        idx
      );
      setAreasProperties(newAreasProperties);
    }
  };

  const handleCloseModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onChangeLabel = async (id, label) => {
    syncAreasProperties();
    const idx = areasProperties[activePage].findIndex((area) => area.id === id);
    let area = {
      color: colors[colorIndex[activePage] % colors.length],
    };
    setColorIndex((prevState) => {
      prevState[activePage]++;
      return prevState;
    });
    let typeOfLabel = "";
    if (subObject) {
      typeOfLabel = getTypeOfLabel2(types, tOfActiveType, label);
    } else {
      typeOfLabel = getTypeOfLabel(
        types,
        areasProperties[activePage][idx].type,
        label
      );
    }
    const img = extractImage(
      canvasRef,
      imageRef,
      areasProperties,
      activePage,
      areas,
      id
    );
    setActiveImage(img);
    area = { ...area, label, typeOfLabel: typeOfLabel, image: img };

    updateAreaProperty(idx, area);
    if (typeOfLabel === "text") {
      updateAreaProperty(idx, { loading: true });
      const text = await ocr(language, img);
      updateAreaProperty(idx, { text, loading: false });
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
      const id = await handleSubmit(areasProperties[activePage]);
      props.updateAreaProperty(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      handleClose();
    } else {
      const id = await handleSubmit(pageId, areasProperties[activePage]);
      id && toast.success("Object created successfully!");
    }
    // clear();
    setLoadingSubmit(false);
  };

  const updateAreaProperty = (idx, property) => {
    setAreasProperties((prevState) => {
      let newTrialAreas = [...prevState];
      if (idx === -1) {
        const lastIndex = idx + areasProperties[activePage].length;
        newTrialAreas[activePage][lastIndex] = {
          ...newTrialAreas[activePage][lastIndex],
          ...property,
        };
      } else {
        newTrialAreas[activePage][idx] = {
          ...newTrialAreas[activePage][idx],
          ...property,
        };
      }
      return newTrialAreas;
    });
  };

  const updateAreaPropertyById = (id, property) => {
    const newAreasProperties = [...areasProperties];
    newAreasProperties[activePage] = newAreasProperties[activePage].map(
      (area) => {
        if (area.id === id) {
          return {
            ...area,
            ...property,
          };
        }
        return area;
      }
    );
    setAreasProperties(newAreasProperties);
  };

  const onEditText = (id, text) => {
    const newAreasProperties = onEditTextField(
      areasProperties,
      activePage,
      id,
      text
    );
    setAreasProperties(newAreasProperties);
  };

  if (!pages.length) {
    return <Alert severity="error">No pages available.</Alert>;
  }

  const LEFT_COLUMNS = [
    {
      id: uuidv4(),
      label: "Thumbnails",
      position: LEFT_POSITION,
      component: (
        <StudioThumbnails
          pages={pages}
          activePage={activePage}
          onClickImage={onClickImage}
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Recalls",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Recalls</h1>
        </div>
      ),
      props: {},
    },
    {
      id: uuidv4(),
      label: "Micro Learning",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Micro Learning</h1>
        </div>
      ),
      props: {},
    },
    {
      id: uuidv4(),
      label: "Enriching Contents",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Enriching Contents</h1>
        </div>
      ),
      props: {},
    },
    {
      id: uuidv4(),
      label: "Check Yourself",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Check Yourself</h1>
        </div>
      ),
      props: {},
    },
  ];

  let RIGHT_COLUMNS = [
    {
      id: uuidv4(),
      label: "Block Authoring",
      position: LEFT_POSITION,
      component: (
        <StudioActions
          areasProperties={areasProperties}
          setAreasProperties={setAreasProperties}
          activePage={activePage}
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
        />
      ),
    },
    {
      id: uuidv4(),
      label: "Table Of Contents",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Table of Contents</h1>
        </div>
      ),
      props: {},
    },
    {
      id: uuidv4(),
      label: "Glossary & keywords",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Glossary & keywords</h1>
        </div>
      ),
      props: {},
    },
    {
      id: uuidv4(),
      label: "Illustrative Interactions",
      position: LEFT_POSITION,
      component: (
        <div>
          <h1>Illustrative Interactions</h1>
        </div>
      ),
      props: {},
    },
  ];

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
      />
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
      <div className={styles.studio}>
        <BookColumn COLUMNS={LEFT_COLUMNS} activeColumn={LEFT_COLUMNS[0]} />
        <StudioEditor
          areasProperties={areasProperties}
          setAreasProperties={setAreasProperties}
          activePage={activePage}
          imageScaleFactor={imageScaleFactor}
          setImageScaleFactor={setImageScaleFactor}
          areas={areas}
          setAreas={setAreas}
          onChangeHandler={onChangeHandler}
          pages={pages}
          imageRef={imageRef}
        />
        <BookColumn COLUMNS={RIGHT_COLUMNS} activeColumn={RIGHT_COLUMNS[0]} />
      </div>
      <div>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
    </>
  );
};

export default Studio;
