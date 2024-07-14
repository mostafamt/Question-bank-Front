import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import { Button, CircularProgress } from "@mui/material";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useStore } from "../../store/store";
import { getSet2FromSet1, hexToRgbA } from "../../utils/helper";
import axios from "../../axios";
import { toast } from "react-toastify";
import Modal from "../Modal/Modal";
import AreaActions from "../AreaActions/AreaActions";
import Tesseract from "tesseract.js";
import ImageActions from "../ImageActions/ImageActions";
import { v4 as uuidv4 } from "uuid";
import { colors } from "../../constants/highlight-color";
import SubObjectModal from "../Modal/SubObjectModal/SubObjectModal";

import styles from "./studio.module.scss";
import StudioThumbnails from "./StudioThumbnails/StudioThumbnails";
import { uploadBase64 } from "../../utils/upload";
import QuestionNameHeader from "../QuestionNameHeader/QuestionNameHeader";
import { saveBlocks, saveObject } from "../../services/api";
import { constructBoxColors, trimText } from "../../utils/data";
import { onEditTextField } from "../../utils/ocr";

// some comment to redeploy

const Studio = (props) => {
  const {
    images,
    setImages,
    questionName,
    type,
    subObject,
    handleClose,
    objectArea: oArea,
  } = props;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [areas, setAreas] = React.useState([]);
  const [parameters, setParameters] = React.useState([]);
  const [boxColors, setBoxColors] = React.useState([]);
  const [colorIndex, setColorIndex] = React.useState(0);
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const imageRef = React.createRef();
  const canvasRef = React.createRef();
  const { data: state, setFormState } = useStore();
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  const [output, setOutput] = React.useState(null);
  // To Extract Sub Object
  const [showModal, setShowModal] = React.useState(false);
  const [activeType, setActiveType] = React.useState("");
  const [activeImage, setActiveImage] = React.useState("");
  const [pageId, setPageId] = React.useState(images?.[0]?._id);
  const [subTypeObjects, setSubTypeObjects] = React.useState([]);
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const [objectArea, setObjectArea] = React.useState(oArea);

  const onClickImage = (idx) => {
    setActiveIndex(idx);
    setPageId(images?.[idx]?._id);
  };

  const onChangeHandler = (areasParam) => {
    console.log("areasParam= ", areasParam);
    if (areasParam.length > areas.length) {
      setBoxColors([...boxColors, null]);
      setParameters([...parameters, ""]);
    }

    setAreas(areasParam);
  };

  const onChange = (areaParam) => {
    // debounce(() => onChangeHandler());
    onChangeHandler(areaParam);
    // _.debounce(onChangeHandler, 300);
  };

  const onClickDeleteArea = (idx) => {
    setAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setBoxColors((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setResults((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setParameters((prevState) => [...prevState.filter((_, id) => idx !== id)]);
  };

  const getTypeOfParameter = (parameter) => {
    const types = state.types;
    const selectedType = types.find((_type) => _type.typeName === type);
    const labels = selectedType.labels;
    const item = labels.find((label) => {
      const keys = Object.keys(label);
      const key = keys[0];
      return key === parameter;
    });
    const values = Object.values(item);
    return values[0];
  };

  const handleCloseModal = () => setShowModal(false);

  const openModal = (type) => {
    setShowModal(true);
    setActiveType(type);
  };

  const onChangeParameter = (value, idx) => {
    // state
    setActiveType(value);
    const newParameters = [...parameters];
    newParameters[idx] = value;
    setParameters(newParameters);
    const newBoxColors = [...boxColors];
    newBoxColors[idx] = colors[colorIndex];
    setColorIndex((prevState) =>
      prevState === colors.length - 1 ? 0 : prevState + 1
    );
    setBoxColors(newBoxColors);

    const type = getTypeOfParameter(value);
    if (type !== "image" && type !== "text") {
      const activeArea = areas[idx];
      const image = imageRef.current;
      const ratio = image.naturalWidth / image.width;

      const x = activeArea.x * ratio;
      const y = activeArea.y * ratio;
      const width = activeArea.width * ratio;
      const height = activeArea.height * ratio;
      const croppedImage = cropSelectedArea(x, y, width, height);

      // to store coordinates
      if (!subObject) {
        setObjectArea({ x, y, width, height });
      }

      setActiveImage(croppedImage);
      // open Modal
      // Timeout => to solve scroll-hiding problem
      setTimeout(() => {
        openModal(type);
      }, 1000);
    } else {
      extract(newParameters);
    }
  };

  const onClickSubmit = async () => {
    const {
      questionName,
      language,
      domainId,
      domainName,
      subDomainId,
      subDomainName,
      topic,
      objectOwner,
      type,
    } = state;

    const objectElements = await Promise.all(
      results.map(async (item) => ({
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
      type: props.type,
      objectElements,
      blockCoordinates: objectArea,
    };

    console.log(JSON.stringify(data, null, 2));

    try {
      const res = await axios.post("/interactive-objects", data);

      toast.success("Object created successfully!");
      clear();
      if (subObject) {
        handleClose();
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const clear = async () => {
    // CLEAR STATES
    setAreas([]);
    setParameters([]);
    setBoxColors([]);
    setColorIndex(0);
    setResults([]);
    setLoading(false);
  };

  const onEditText = (id, text) => {
    const newResults = onEditTextField(results, id, text);
    setResults(newResults);
  };

  const extract = async (newParameters) => {
    if (loading) return;
    setLoading(true);
    const image = imageRef.current;
    const ratio = image.naturalWidth / image.width;

    setResults([]);

    await Promise.all(
      areas.map(async (area, idx) => {
        const x = area.x * ratio;
        const y = area.y * ratio;
        const width = area.width * ratio;
        const height = area.height * ratio;
        const croppedImage = cropSelectedArea(x, y, width, height);
        const id = uuidv4();
        const text = await ocr(croppedImage, newParameters[idx], y);
        setResults((prevState) => [
          ...prevState,
          {
            id,
            image: croppedImage,
            parameter: newParameters[idx],
            type: getTypeOfParameter(newParameters[idx]),
            x,
            y,
            width,
            height,
            text,
          },
        ]);
        // const text = await ocr(croppedImage, newParameters[idx], y);
        // setResults((prevState) =>
        //   prevState.map((item) => {
        //     if (item.id === id) {
        //       const newItem = { ...item, text };
        //       return newItem;
        //     }
        //     return item;
        //   })
        // );
      })
    );
    // SORT BY Y COORDINATE
    setResults((prevState) => [...prevState.sort((a, b) => a.y - b.y)]);
    setLoading(false);
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

  const ocr = async (dataUrl) => {
    const language = getSet2FromSet1(state.language);
    let text = "";
    try {
      const result = await Tesseract.recognize(dataUrl, language);
      text = result.data.text;
    } catch (err) {
      console.error(err);
    }
    return trimText(text);
  };

  return (
    <>
      <Modal show={showModal} handleClose={handleCloseModal} size="xl">
        <SubObjectModal
          handleClose={handleCloseModal}
          image={activeImage}
          name={`${state.questionName} - ${activeType}`}
          type={activeType}
          results={results}
          setResults={setResults}
          parameter={""}
          y={""}
          objectArea={objectArea}
          setSubTypeObjects={setSubTypeObjects}
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
            "& > div:nth-of-type(2)": constructBoxColors(boxColors),
          }}
        >
          <ImageActions
            imageScaleFactor={imageScaleFactor}
            setImageScaleFactor={setImageScaleFactor}
            areas={areas}
            setAreas={setAreas}
          />
          <AreaSelector areas={areas} onChange={onChange}>
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
          {areas.map((area, idx) => (
            <AreaActions
              key={area}
              parameters={parameters}
              parameter={parameters[idx]}
              color={boxColors[idx]}
              idx={idx}
              boxColors={boxColors}
              onChangeParameter={onChangeParameter}
              loading={loading}
              extractedTextList={results}
              onEditText={onEditText}
              onClickDeleteArea={() => onClickDeleteArea(idx)}
              type={type}
              labels={state.labels}
            />
          ))}
          {results.length > 0 && (
            <div>
              <Button
                variant="contained"
                onClick={onClickSubmit}
                sx={{ width: "100%" }}
                disabled={loadingSubmit}
                startIcon={
                  loadingSubmit ? <CircularProgress size="1rem" /> : <></>
                }
              >
                Submit
              </Button>
            </div>
          )}
          Num of areas: {areas.length}
        </div>
      </div>
    </>
  );
};

export default Studio;
