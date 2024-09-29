import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
/** @jsxImportSource @emotion/react */
import { useStore } from "../../store/store";
import { toast } from "react-toastify";
import Modal from "../Modal/Modal";
import AreaActions from "../AreaActions/AreaActions";
import ImageActions from "../ImageActions/ImageActions";
import { v4 as uuidv4 } from "uuid";
import { colors } from "../../constants/highlight-color";
import SubObjectModal from "../Modal/SubObjectModal/SubObjectModal";

import StudioThumbnails from "./StudioThumbnails/StudioThumbnails";
import {
  constructBoxColors,
  getSimpleTypes,
  getTypeNameOfLabelKey,
  getTypeOfLabel,
  getTypeOfLabel2,
  ocr,
  onEditTextField,
} from "../../utils/ocr";

import styles from "./studio.module.scss";
import { Box } from "@mui/material";

const Studio = (props) => {
  const { pages, type, subObject, handleClose, types, handleSubmit } = props;
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

  const [drawnAreas, setDrawnAreas] = React.useState(
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
            order: 0,
            open: true,
          };
        }) || []
    ) || Array(pages?.length || 1).fill([])
  );

  const [colorIndex, setColorIndex] = React.useState(
    Array(pages?.length || 1).fill(0)
  );
  const imageRef = React.createRef();
  const canvasRef = React.createRef();
  const { data: state, setFormState } = useStore();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  // To Extract Sub Object
  const [showModal, setShowModal] = React.useState(false);
  const [activeType, setActiveType] = React.useState("");
  const [activeImage, setActiveImage] = React.useState("");
  const [pageId, setPageId] = React.useState(pages?.[0]?._id);
  const [subTypeObjects, setSubTypeObjects] = React.useState([]);
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const onClickImage = (idx) => {
    setActivePage(idx);
    setPageId(pages?.[idx]?._id);
  };

  const syncDrawnAreas = () => {
    let newAreas = [];

    for (let block = 0; block < drawnAreas[activePage].length; block++) {
      newAreas = [
        ...newAreas,
        {
          x: areas[activePage][block].x,
          y: areas[activePage][block].y,
          width: areas[activePage][block].width,
          height: areas[activePage][block].height,
          id: drawnAreas[activePage][block].id,
          color: drawnAreas[activePage][block].color,
          loading: drawnAreas[activePage][block].loading,
          text: drawnAreas[activePage][block].text,
          image: drawnAreas[activePage][block].image,
          type: drawnAreas[activePage][block].type,
          label: drawnAreas[activePage][block].label,
          typeOfLabel: drawnAreas[activePage][block].typeOfLabel,
          parameter: drawnAreas[activePage][block].parameter,
          order: drawnAreas[activePage][block].order,
          open: drawnAreas[activePage][block].open,
        },
      ];
    }

    if (areas[activePage].length > drawnAreas[activePage].length) {
      newAreas = [
        ...newAreas,
        {
          x: areas[areas.length - 1].x,
          y: areas[areas.length - 1].y,
          width: areas[areas.length - 1].width,
          height: areas[areas.length - 1].height,
          id: uuidv4(),
          color: null,
          loading: false,
          text: "",
          image: "",
          type: subObject ? type : "",
          parameter: "",
          label: "",
          typeOfLabel: "",
          order: areas.length - 1,
          open: true,
        },
      ];
    }

    const newDrawnAreas = [...drawnAreas];
    newDrawnAreas[activePage] = newAreas;
    setDrawnAreas(newDrawnAreas);
  };

  const onChangeHandler = (areasParam) => {
    if (areasParam.length > drawnAreas[activePage].length) {
      syncDrawnAreas();
    }

    const newAreasParam = [...areas];
    newAreasParam[activePage] = areasParam;
    setAreas(newAreasParam);
  };

  const onClickDeleteArea = (idx) => {
    setAreas((prevState) => {
      const newAreas = [...prevState];
      newAreas[activePage] = newAreas[activePage].filter((_, id) => idx !== id);
      return newAreas;
    });

    setDrawnAreas((prevState) => {
      const newDrawnAreas = [...prevState];
      newDrawnAreas[activePage] = newDrawnAreas[activePage].filter(
        (_, id) => idx !== id
      );
      return newDrawnAreas;
    });
  };

  const handleCloseModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onChangeAreaItem = (id, key, value) => {
    syncDrawnAreas();
    const newAreas = drawnAreas[activePage].map((item, idx) => {
      if (item.id === id) {
        if (key === "label") {
          onChangeLabel(idx, value);
        }
        return {
          ...item,
          [key]: value,
        };
      }
      return item;
    });
    const newDrawnAreas = [...drawnAreas];
    newDrawnAreas[activePage] = newAreas;
    setDrawnAreas(newDrawnAreas);
  };

  const onChangeLabel = async (id, label) => {
    syncDrawnAreas();
    const idx = drawnAreas[activePage].findIndex((area) => area.id === id);
    let area = {
      color: colors[colorIndex[activePage] % colors.length],
    };
    setColorIndex((prevState) => {
      prevState[activePage]++;
      return prevState;
    });
    let typeOfLabel = "";
    if (subObject) {
      typeOfLabel = getTypeOfLabel2(
        types,
        drawnAreas[activePage][idx].type,
        label
      );
    } else {
      typeOfLabel = getTypeOfLabel(
        types,
        drawnAreas[activePage][idx].type,
        label
      );
    }
    const img = extractImage(id);
    setActiveImage(img);
    area = { ...area, label, typeOfLabel: typeOfLabel, image: img };

    updateTrialAreas(idx, area);
    if (typeOfLabel === "text") {
      updateTrialAreas(idx, { loading: true });
      const text = await ocr(state.language, img);
      updateTrialAreas(idx, { text, loading: false });
    } else {
      // open modal if it has a supported type
      const simpleTypes = getSimpleTypes();
      let found = simpleTypes.find((type) => type === typeOfLabel);
      if (found) {
        setActiveType(label);
        setTimeout(() => {
          openModal();
        }, 1000);
      }
    }
  };

  const extractImage = (id) => {
    const idx = drawnAreas[activePage].findIndex((item) => item.id === id);
    const activeArea = areas[activePage][idx];
    const image = imageRef.current;
    const ratio = image.naturalWidth / image.width;
    const x = activeArea.x * ratio;
    const y = activeArea.y * ratio;
    const width = activeArea.width * ratio;
    const height = activeArea.height * ratio;
    const croppedImage = cropSelectedArea(x, y, width, height);
    return croppedImage;
  };

  const onClickSubmit = async () => {
    setLoadingSubmit(true);
    if (subObject) {
      const id = await props.handleSubmit(drawnAreas[activePage]);
      props.updateTrialAreas(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      handleClose();
    } else {
      // Need page_id
      const id = await handleSubmit(pageId, drawnAreas[activePage]);
      id && toast.success("Object created successfully!");
    }
    // clear();
    setLoadingSubmit(false);
  };

  const updateTrialAreas = (idx, value) => {
    setDrawnAreas((prevState) => {
      let newTrialAreas = [...prevState];
      if (idx === -1) {
        const lastIndex = drawnAreas[activePage].length - 1;
        newTrialAreas[activePage][lastIndex] = {
          ...newTrialAreas[activePage][lastIndex],
          ...value,
        };
      } else {
        newTrialAreas[activePage][idx] = {
          ...newTrialAreas[activePage][idx],
          ...value,
        };
      }
      return newTrialAreas;
    });
  };

  // const clear = async () => {
  //   // CLEAR STATES
  //   setAreas(Array(pages.length).fill([]) );
  //   setColorIndex(Array(pages.length).fill(0));
  //   setDrawnAreas([]);
  // };

  const onEditText = (id, text) => {
    const newResults = onEditTextField(drawnAreas[activePage], id, text);
    setDrawnAreas((prevState) => {
      prevState[activePage] = newResults;
      return prevState;
    });
  };

  const cropSelectedArea = (x, y, width, height) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    return dataUrl;
  };

  return (
    <>
      <Modal show={showModal} handleClose={handleCloseModal} size="xl">
        <SubObjectModal
          handleClose={handleCloseModal}
          image={activeImage}
          type={activeType}
          types={types}
          setSubTypeObjects={setSubTypeObjects}
          updateTrialAreas={updateTrialAreas}
        />
      </Modal>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <button
          style={{ backgroundColor: "#eee", border: 0 }}
          onClick={() => {
            setFormState({ ...state, language: "en" });
          }}
        >
          EN
        </button>
        <button
          style={{ backgroundColor: "#eee", border: 0 }}
          onClick={() => {
            setFormState({ ...state, language: "ar" });
          }}
        >
          AR
        </button>
      </Box>
      <div className={styles.studio}>
        <StudioThumbnails
          pages={pages}
          activePage={activePage}
          onClickImage={onClickImage}
        />
        <div
          className={styles.editor}
          css={{
            "& > div:nth-of-type(2)": constructBoxColors(
              drawnAreas[activePage]
            ),
          }}
        >
          <ImageActions
            imageScaleFactor={imageScaleFactor}
            setImageScaleFactor={setImageScaleFactor}
            areas={areas}
            setAreas={setAreas}
          />
          <AreaSelector areas={areas[activePage]} onChange={onChangeHandler}>
            <img
              src={pages[activePage].url}
              alt={pages[activePage]?.url || pages[activePage]}
              crossOrigin="anonymous"
              ref={imageRef}
              style={{
                width: `${imageScaleFactor * 100}%`,
                overflow: "scroll",
              }}
            />
          </AreaSelector>

          <div>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          </div>
        </div>
        <div className={styles.actions}>
          <AreaActions
            trialAreas={drawnAreas[activePage]}
            setTrialAreas={setDrawnAreas}
            onEditText={onEditText}
            onClickDeleteArea={onClickDeleteArea}
            type={type}
            onClickSubmit={onClickSubmit}
            loadingSubmit={loadingSubmit}
            updateTrialAreas={updateTrialAreas}
            types={types}
            onChangeAreaItem={onChangeAreaItem}
            onChangeLabel={onChangeLabel}
            subObject={subObject}
          />
        </div>
      </div>
    </>
  );
};

export default Studio;
