import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import { Button } from "@mui/material";
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

const Studio = (props) => {
  const { images, setImages, questionName, type, subObject, handleClose } =
    props;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [areas, setAreas] = React.useState([]);
  // TODO: set areas foreach page.
  const [newAreas, setNewAreas] = React.useState(Array(images.length).fill([]));
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

  const onClickImage = (idx) => {
    setActiveIndex(idx);
  };

  const onChangeHandler = (areasParam) => {
    if (areasParam.length > areas.length) {
      setBoxColors([...boxColors, null]);
      setParameters([...parameters, ""]);
    }

    if (areasParam.length > newAreas[activeIndex].length) {
      setBoxColors([...boxColors, null]);
      setParameters([...parameters, ""]);
    }

    setNewAreas((prevState) => {
      prevState[activeIndex] = areasParam;
      return [...prevState];
    });

    setAreas(areasParam);
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
    console.log("value= ", value);
    setActiveType(value);
    console.log("state= ", state);
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
    console.log("type= ", type);
    if (type !== "image" && type !== "text") {
      const activeArea = areas[idx];
      const image = imageRef.current;
      const ratio = image.naturalWidth / image.width;

      const x = activeArea.x * ratio;
      const y = activeArea.y * ratio;
      const width = activeArea.width * ratio;
      const height = activeArea.height * ratio;
      const croppedImage = cropSelectedArea(x, y, width, height);

      setActiveImage(croppedImage);
      // open Modal
      openModal(type);
    } else {
      extract(newParameters);
    }
  };

  const constructBoxColors = () => {
    const values = boxColors.map((_, idx) => `& > div:nth-child(${idx + 2})`);

    const obj = boxColors.map((color, idx) => {
      if (values[idx]) {
        return {
          [values[idx]]: {
            border: `2px solid ${color} !important`,
            backgroundColor: `${hexToRgbA(color)}`,
          },
        };
      } else {
        return {};
      }
    });

    return obj;
  };

  const saveObject = async () => {
    const data = { ...state };
    const res = await axios.post("/interactive-objects", {
      ...data,
      isAnswered: "g", // g, y , r
      parameters: {},
      questionName,
      type,
    });
    toast.success("Question created successfully!");
    return res.data;
  };

  const onClickSubmit = async () => {
    const id = await saveObject();

    const objectElements = await Promise.all(
      results.map(async (item) => ({
        [item.parameter]:
          item.type === "image" ? await uploadBase64(item.image) : item.text,
      }))
    );

    try {
      const res = await axios.post(`saveObject${type}/${id}`, {
        objectElements,
      });

      toast.success("Question parameters updated successfully!");
      clear();
      if (subObject) {
        handleClose();
      }
    } catch (error) {
      toast.error(error.message);
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
    const newExtractedTextList = results.map((item) => {
      if (item.id === id) {
        item.text = text;
      }
      return item;
    });
    setResults(newExtractedTextList);
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
        setResults((prevState) => [
          ...prevState,
          {
            id,
            image: croppedImage,
            parameter: newParameters[idx],
            type: getTypeOfParameter(newParameters[idx]),
            y,
          },
        ]);
        const text = await ocr(croppedImage, newParameters[idx], y);
        setResults((prevState) =>
          prevState.map((item) => {
            if (item.id === id) {
              const newItem = { ...item, text };
              return newItem;
            }
            return item;
          })
        );
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

  const trimText = (text) => text.replaceAll("\n", "");

  const ocr = async (dataUrl) => {
    console.log(state);
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
          setResults={setResults}
          parameter={""}
          y={""}
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
            "& > div:nth-child(2)": constructBoxColors(),
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
              src={images[activeIndex]}
              alt={images[activeIndex]}
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
