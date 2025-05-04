import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
/** @jsxImportSource @emotion/react */
import { useStore } from "../../../store/store";
import { toast } from "react-toastify";
import Modal from "../../Modal/Modal";
import ImageActions from "../../ImageActions/ImageActions";
import { v4 as uuidv4 } from "uuid";
import { colors } from "../../../constants/highlight-color";
import SubObjectModal from "../../Modal/SubObjectModal/SubObjectModal";

import StudioThumbnails from "../StudioThumbnails/StudioThumbnails";
import {
  oldUploadBase64,
  uploadBase64,
  uploadForStudio,
} from "../../../utils/upload";
import { constructBoxColors } from "../../../utils/ocr";
import { saveObject } from "../../../services/api";

import styles from "./autoGenerationStudio.module.scss";
import AreaActions from "../../AutoGeneration/AreaActions/AreaActions";

const AutoGenerationStudio = (props) => {
  const { images, setImages, questionName, type, subObject, handleClose } =
    props;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [areas, setAreas] = React.useState([]);
  const [colorIndex, setColorIndex] = React.useState(0);
  const imageRef = React.useRef();
  const canvasRef = React.createRef();
  const { data: state } = useStore();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  // To Extract Sub Object
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
    setTrialAreas(areasParam);
    setAreas(areasParam);
  };

  const onClickDeleteArea = (idx) => {
    setAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setTrialAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
  };

  const onClickSubmit = async () => {
    setLoadingSubmit(true);

    const {
      language,
      domainId,
      domainName,
      subDomainId,
      subDomainName,
      topic,
      objectOwner,
    } = state;

    const { x, y, width, height } = areas[0];

    const ratioX = imageRef.current.naturalWidth / imageRef.current.clientWidth;
    const ratioY =
      imageRef.current.naturalHeight / imageRef.current.clientHeight;

    const imageBase64 = cropSelectedArea(
      x * ratioX,
      y * ratioY,
      width * ratioX,
      height * ratioY
    );
    setCroppedImage(imageBase64);

    const url = await uploadForStudio(imageBase64);
    console.log("url= ", url);

    const objectElements = [
      {
        image: url,
      },
    ];

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
      toast.success("Object created successfully!");
      clear();
    }
    setLoadingSubmit(false);
    return id;
  };

  const updateTrialAreas = (idx, value) => {
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
    <div className={styles["auto-generation-studio"]}>
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
        <AreaSelector areas={areas} onChange={onChangeHandler} maxAreas={1}>
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
          type={type}
          labels={state.labels}
          onClickSubmit={onClickSubmit}
          loadingSubmit={loadingSubmit}
          updateTrialAreas={updateTrialAreas}
          croppedImage={croppedImage}
        />
      </div>
    </div>
  );
};

export default AutoGenerationStudio;
