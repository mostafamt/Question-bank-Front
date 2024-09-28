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
  const {
    images,
    setImages,
    questionName,
    type,
    subObject,
    handleClose,
    types,
    handleSubmit,
    blocks,
  } = props;
  const [activePage, setActivePage] = React.useState(0);
  const [areas, setAreas] = React.useState(
    blocks?.map((item) => ({
      x: item.coordinates.x,
      y: item.coordinates.y,
      width: item.coordinates.width,
      height: item.coordinates.height,
      unit: "px",
      isChanging: true,
      isNew: true,
    })) || []
  );
  const [drawnAreas, setDrawnAreas] = React.useState(
    blocks?.map((item, idx) => {
      let typeName = getTypeNameOfLabelKey(types, item.contentType);

      return {
        x: item.coordinates.x,
        y: item.coordinates.y,
        width: item.coordinates.width,
        height: item.coordinates.height,
        id: uuidv4(),
        color: colors[idx % colors.length],
        loading: false,
        text: item.contentValue,
        image: item.contentValue,
        // type: "Simple item",
        type: typeName,
        parameter: "",
        label: item.contentType,
        typeOfLabel: getTypeOfLabel(types, typeName, item.contentType),
        order: 0,
        open: true,
      };
    }) || []
  );

  const [colorIndex, setColorIndex] = React.useState(0);
  const imageRef = React.createRef();
  const canvasRef = React.createRef();
  const { data: state, setFormState } = useStore();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  // To Extract Sub Object
  const [showModal, setShowModal] = React.useState(false);
  const [activeType, setActiveType] = React.useState("");
  const [activeImage, setActiveImage] = React.useState("");
  const [pageId, setPageId] = React.useState(images?.[0]?._id);
  const [subTypeObjects, setSubTypeObjects] = React.useState([]);
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const onClickImage = (idx) => {
    setActivePage(idx);
    setPageId(images?.[idx]?._id);
  };

  const onChangeHandler = (areasParam) => {
    let newAreas = [];
    for (let i = 0; i < drawnAreas.length; i++) {
      newAreas = [
        ...newAreas,
        {
          x: areasParam[i].x,
          y: areasParam[i].y,
          width: areasParam[i].width,
          height: areasParam[i].height,

          id: drawnAreas[i].id,
          color: drawnAreas[i].color,
          loading: drawnAreas[i].loading,
          text: drawnAreas[i].text,
          image: drawnAreas[i].image,
          type: drawnAreas[i].type,
          label: drawnAreas[i].label,
          typeOfLabel: drawnAreas[i].typeOfLabel,
          parameter: drawnAreas[i].parameter,
          order: drawnAreas[i].order,
          open: drawnAreas[i].open,
        },
      ];
    }

    if (areasParam.length > drawnAreas.length) {
      newAreas = [
        ...newAreas,
        {
          x: areasParam[areasParam.length - 1].x,
          y: areasParam[areasParam.length - 1].y,
          width: areasParam[areasParam.length - 1].width,
          height: areasParam[areasParam.length - 1].height,

          id: uuidv4(),
          color: null,
          loading: false,
          text: "",
          image: "",
          type: subObject ? type : "",
          parameter: "",
          label: "",
          typeOfLabel: "",
          order: areasParam.length - 1,
          open: true,
        },
      ];
    }

    setDrawnAreas([...newAreas]);
    setAreas(areasParam);
  };

  const onClickDeleteArea = (idx) => {
    setAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setDrawnAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
  };

  const handleCloseModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onChangeAreaItem = (id, key, value) => {
    const newAreas = drawnAreas.map((item, idx) => {
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

    setDrawnAreas(newAreas);
  };

  const onChangeLabel = async (id, label) => {
    const idx = drawnAreas.findIndex((area) => area.id === id);

    let area = { color: colors[colorIndex] };
    setColorIndex((prevState) =>
      prevState === colors.length - 1 ? 0 : prevState + 1
    );

    let typeOfLabel = "";

    if (subObject) {
      typeOfLabel = getTypeOfLabel2(types, drawnAreas[idx].type, label);
    } else {
      typeOfLabel = getTypeOfLabel(types, drawnAreas[idx].type, label);
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
    const idx = drawnAreas.findIndex((item) => item.id === id);

    const activeArea = areas[idx];
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
      const id = await props.handleSubmit(
        `question - ${type}`,
        type,
        drawnAreas
      );
      props.updateTrialAreas(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      handleClose();
    } else {
      // Need page_id
      const id = await handleSubmit(activePage, drawnAreas);
      id && toast.success("Object created successfully!");
    }
    clear();
    setLoadingSubmit(false);
  };

  const updateTrialAreas = (idx, value) => {
    setDrawnAreas((prevState) => {
      let newTrialAreas = [...prevState];

      if (idx === -1) {
        const lastIndex = drawnAreas.length - 1;
        newTrialAreas[lastIndex] = { ...newTrialAreas[lastIndex], ...value };
      } else {
        newTrialAreas[idx] = { ...newTrialAreas[idx], ...value };
      }

      return newTrialAreas;
    });
  };

  const clear = async () => {
    // CLEAR STATES
    setAreas([]);
    setColorIndex(0);

    setDrawnAreas([]);
  };

  const onEditText = (id, text) => {
    const newResults = onEditTextField(drawnAreas, id, text);
    setDrawnAreas(newResults);
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
          results={drawnAreas}
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
          images={images}
          setImages={setImages}
          activePage={activePage}
          onClickImage={onClickImage}
        />
        <div
          className={styles.editor}
          css={{
            "& > div:nth-of-type(2)": constructBoxColors(drawnAreas),
          }}
        >
          <ImageActions
            imageScaleFactor={imageScaleFactor}
            setImageScaleFactor={setImageScaleFactor}
            areas={areas}
            setAreas={setAreas}
          />
          <AreaSelector areas={areas} onChange={onChangeHandler}>
            <img
              src={images[activePage]?.url || images[activePage]}
              alt={images[activePage]?.url || images[activePage]}
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
            trialAreas={drawnAreas}
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
