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
import { uploadBase64, uploadForStudio } from "../../utils/upload";
import {
  ARABIC,
  ENGLISH,
  constructBoxColors,
  getSimpleTypes,
  getTypeOfParameter,
  ocr,
  onEditTextField,
} from "../../utils/ocr";
import { saveObject } from "../../services/api";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

import styles from "./studio.module.scss";

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
  const [language, setLanguage] = React.useState(
    state.language === "ar" ? ARABIC : ENGLISH
  );
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
          type: trialAreas[i].type,
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
      type: typeOfParameter,
      color: colors[colorIndex],
    });

    setColorIndex((prevState) =>
      prevState === colors.length - 1 ? 0 : prevState + 1
    );

    console.log("typeOfParameter= ", typeOfParameter);
    if (typeOfParameter === "text" || typeOfParameter === "number") {
      exract(value, idx);
    } else if (typeOfParameter === "Coordinate") {
      const x = Number.parseInt(trialAreas[idx].x);
      const y = Number.parseInt(trialAreas[idx].y);
      const text = `x= ${x}; y=${y};`;
      updateTrialAreas(idx, {
        text: text,
      });
    } else if (typeOfParameter === "SI") {
      setTimeout(() => {
        openModal();
      }, 1000);
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
    const text = await ocr(language, croppedImage);

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
            item.type === "image"
              ? await uploadForStudio(item.image)
              : item.text,
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
    if (id) {
      // clear();
    }
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

  return (
    <>
      <Modal show={showModal} handleClose={handleCloseModal} size="xl">
        <SubObjectModal
          handleClose={handleCloseModal}
          image={activeImage}
          type={activeType}
          setSubTypeObjects={setSubTypeObjects}
          handleSubmit={handleSubmit}
          updateTrialAreas={updateTrialAreas}
        />
      </Modal>
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
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
