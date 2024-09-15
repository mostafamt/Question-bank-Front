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
import { uploadBase64 } from "../../utils/upload";
import {
  constructBoxColors,
  getSimpleTypes,
  getTypeOfLabel,
  getTypeOfParameter,
  ocr,
  onEditTextField,
  useLabels,
  useTypes,
} from "../../utils/ocr";

import styles from "./studio.module.scss";
import { fakeSaveObject, saveBlocks, saveObject } from "../../services/api";

const Studio = (props) => {
  const { images, setImages, questionName, type, subObject, handleClose } =
    props;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [areas, setAreas] = React.useState([]);
  const [colorIndex, setColorIndex] = React.useState(0);
  const imageRef = React.createRef();
  const canvasRef = React.createRef();
  const { data: state } = useStore();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  // To Extract Sub Object
  const [showModal, setShowModal] = React.useState(false);
  const [activeType, setActiveType] = React.useState("");
  const [activeImage, setActiveImage] = React.useState("");
  const [pageId, setPageId] = React.useState(images?.[0]?._id);
  const [subTypeObjects, setSubTypeObjects] = React.useState([]);
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const [trialAreas, setTrialAreas] = React.useState([]);
  const types = useTypes();

  const onClickImage = (idx) => {
    setActiveIndex(idx);
    setPageId(images?.[idx]?._id);
  };

  const onChangeHandler = (areasParam) => {
    let newAreas = [];
    for (let i = 0; i < trialAreas.length; i++) {
      newAreas = [
        ...newAreas,
        {
          x: areasParam[i].x,
          y: areasParam[i].y,
          width: areasParam[i].width,
          height: areasParam[i].height,

          id: trialAreas[i].id,
          color: trialAreas[i].color,
          loading: trialAreas[i].loading,
          text: trialAreas[i].text,
          image: trialAreas[i].image,
          type: trialAreas[i].type,
          label: trialAreas[i].label,
          typeOfLabel: trialAreas[i].typeOfLabel,
          parameter: trialAreas[i].parameter,
          order: trialAreas[i].order,
          open: trialAreas[i].open,
        },
      ];
    }

    if (areasParam.length > trialAreas.length) {
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
          type: "",
          parameter: "",
          label: "",
          typeOfLabel: "",
          order: areasParam.length - 1,
          open: true,
        },
      ];
    }

    setTrialAreas([...newAreas]);
    setAreas(areasParam);
  };

  const onClickDeleteArea = (idx) => {
    setAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setTrialAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
  };

  const handleCloseModal = () => setShowModal(false);
  const openModal = () => setShowModal(true);

  const onChangeAreaItem = (id, key, value) => {
    const newAreas = trialAreas.map((item, idx) => {
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

    setTrialAreas(newAreas);
  };

  const onChangeLabel = async (id, label) => {
    const idx = trialAreas.findIndex((area) => area.id === id);

    let area = { color: colors[colorIndex] };
    setColorIndex((prevState) =>
      prevState === colors.length - 1 ? 0 : prevState + 1
    );

    const typeOfLabel = getTypeOfLabel(
      state.types,
      trialAreas[idx].type,
      label
    );

    const img = extractImage(id);

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
        // timeout to solve scrollbar hiding
        setTimeout(() => {
          openModal();
        }, 1000);
      }
    }
  };

  const extractImage = (id) => {
    const idx = trialAreas.findIndex((item) => item.id === id);

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

  const handleSubmit = async (questionName, type, areas) => {
    const {
      language,
      domainId,
      domainName,
      subDomainId,
      subDomainName,
      topic,
      objectOwner,
    } = state;

    const blocks = await Promise.all(
      [...areas]
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          pageId: "66684e63e4163f0056e5fc29",
          coordinates: {
            x: 12.5,
            y: 12.5,
            width: 10,
            height: 20,
          },
          contentType: "Any Type",
          contentValue: "some text",

          // [item.parameter]:
          //   item.type === "image" ? await uploadBase64(item.image) : item.text,
        }))
    );

    const data = {
      blocks,
    };

    const id = await saveBlocks(data);
    return id;
  };

  const onClickSubmit = async () => {
    setLoadingSubmit(true);
    if (subObject) {
      const { questionName } = state;
      const name = `${questionName} - ${props.type}`;
      const id = await props.handleSubmit(name, type, trialAreas);
      props.updateTrialAreas(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      handleClose();
    } else {
      const { questionName, type } = state;
      const id = await handleSubmit(questionName, type, trialAreas);
      id && toast.success("Object created successfully!");
    }
    clear();
    setLoadingSubmit(false);
  };

  const updateTrialAreas = (idx, value) => {
    setTrialAreas((prevState) => {
      let newTrialAreas = [...prevState];

      if (idx === -1) {
        const lastIndex = trialAreas.length - 1;
        newTrialAreas[lastIndex] = { ...newTrialAreas[lastIndex], ...value };
      } else {
        console.log("newTrialAreas[idx]= ", newTrialAreas[idx]);
        console.log("value= ", value);
        newTrialAreas[idx] = { ...newTrialAreas[idx], ...value };
      }

      console.log("newTrialAreas= ", newTrialAreas);
      return newTrialAreas;
    });
  };

  const clear = async () => {
    // CLEAR STATES
    setAreas([]);
    setColorIndex(0);

    setTrialAreas([]);
  };

  const onEditText = (id, text) => {
    const newResults = onEditTextField(trialAreas, id, text);
    setTrialAreas(newResults);
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
          name={`${state.questionName} - ${activeType}`}
          type={activeType}
          results={trialAreas}
          setSubTypeObjects={setSubTypeObjects}
          handleSubmit={handleSubmit}
          updateTrialAreas={updateTrialAreas}
        />
      </Modal>
      <div className={styles.studio}>
        <StudioThumbnails
          images={images}
          setImages={setImages}
          activeIndex={activeIndex}
          onClickImage={onClickImage}
        />
        <div
          className={styles.editor}
          css={{
            "& > div:nth-of-type(2)": constructBoxColors(trialAreas),
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
              src={images[activeIndex]?.url || images[activeIndex]}
              alt={images[activeIndex]?.url || images[activeIndex]}
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
            trialAreas={trialAreas}
            setTrialAreas={setTrialAreas}
            onEditText={onEditText}
            onClickDeleteArea={onClickDeleteArea}
            type={type}
            labels={state.labels}
            onClickSubmit={onClickSubmit}
            loadingSubmit={loadingSubmit}
            updateTrialAreas={updateTrialAreas}
            types={types}
            onChangeAreaItem={onChangeAreaItem}
            onChangeLabel={onChangeLabel}
          />
        </div>
      </div>
    </>
  );
};

export default Studio;
