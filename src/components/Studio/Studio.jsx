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
  getTypeOfParameter,
  ocr,
  onEditTextField,
} from "../../utils/ocr";

// some comment to push

import styles from "./studio.module.scss";
import { fakeSaveObject, saveObject } from "../../services/api";

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
  const [croppedImage, setCroppedImage] = React.useState("");

  const [trialAreas, setTrialAreas] = React.useState([]);

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
          parameter: "Select a parameter",
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

  const onChangeParameter = (value, idx) => {
    // state
    setActiveType(value);

    //
    let newTrialAreas = [...trialAreas];
    newTrialAreas[idx].color = colors[colorIndex];
    // newTrialAreas[idx].parameter = value;
    setTrialAreas(newTrialAreas);
    //

    setColorIndex((prevState) =>
      prevState === colors.length - 1 ? 0 : prevState + 1
    );

    const typeOfParameter = getTypeOfParameter(state.types, type, value);

    const activeArea = areas[idx];
    const image = imageRef.current;
    const ratio = image.naturalWidth / image.width;

    const x = activeArea.x * ratio;
    const y = activeArea.y * ratio;
    const width = activeArea.width * ratio;
    const height = activeArea.height * ratio;
    const croppedImage = cropSelectedArea(x, y, width, height);
    setActiveImage(croppedImage);
    updateTrialAreas(idx, {
      parameter: value,
      image: croppedImage,
      type: getTypeOfParameter(state.types, type, value),
    });

    if (typeOfParameter === "text") {
      exract(value, idx);
    } else {
      // open modal if it has a supported type
      const simpleTypes = getSimpleTypes();
      let found = simpleTypes.find((type) => type === typeOfParameter);
      if (found) {
        // timeout to solve scrollbar hiding
        setTimeout(() => {
          openModal();
        }, 1000);
      }
    }
  };

  const exract = async (value, idx) => {
    updateTrialAreas(idx, { loading: true });

    const image = imageRef.current;
    const ratio = image.naturalWidth / image.width;

    const area = areas[idx];
    const x = area.x * ratio;
    const y = area.y * ratio;
    const width = area.width * ratio;
    const height = area.height * ratio;
    const croppedImage = cropSelectedArea(x, y, width, height);
    const text = await ocr(state.language, croppedImage);

    updateTrialAreas(idx, { text, loading: false });
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

    const objectElements = await Promise.all(
      [...areas]
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          [item.parameter]:
            item.type === "image" ? await uploadBase64(item.image) : item.text,
        }))
    );

    const data = {
      questionName,
      language,
      domainId,
      domainName,
      subDomainId,
      subDomainName,
      topic,
      objectOwner,
      type,
      objectElements,
    };

    const id = await saveObject(data);
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
    console.log("updateTrialAreas");
    console.log("value= ", value);
    setTrialAreas((prevState) => {
      let newTrialAreas = [...prevState];

      if (idx === -1) {
        const lastIndex = trialAreas.length - 1;
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

  const onClickCrop = () => {
    if (areas.length) {
      const area = areas[areas.length - 1];
      const image = imageRef.current;
      const ratio = image.naturalWidth / image.width;

      const x = area.x * ratio;
      const y = area.y * ratio;
      const width = area.width * ratio;
      const height = area.height * ratio;
      const cImage = cropSelectedArea(x, y, width, height);

      setAreas([]);
      setTrialAreas([]);

      const newImages = [...images];
      newImages[activeIndex] = cImage;
      setImages(newImages);
    }
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
            onClickCrop={onClickCrop}
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
            onChangeParameter={onChangeParameter}
            onEditText={onEditText}
            onClickDeleteArea={onClickDeleteArea}
            type={type}
            labels={state.labels}
            onClickSubmit={onClickSubmit}
            loadingSubmit={loadingSubmit}
            updateTrialAreas={updateTrialAreas}
          />
        </div>
      </div>
    </>
  );
};

export default Studio;
