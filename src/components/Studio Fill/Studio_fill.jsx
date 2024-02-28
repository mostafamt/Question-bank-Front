import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForever from "@mui/icons-material/DeleteForever";
import { Button, CircularProgress } from "@mui/material";
import OCR from "../../utils/OCR/OCR";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useStore } from "../../store/store";
import {
  constructFillTheBlankParametersFromKeyValuePairs,
  hexToRgbA,
} from "../../utils/helper_fill";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { toast } from "react-toastify";
import Modal from "../Modal/Modal";
import EditParametersModal from "../Modal/EditParametersModal/EditParametersModal";
import AreaActions from "../AreaActions/AreaActions";
import Tesseract from "tesseract.js";
import ImageActions from "../ImageActions/ImageActions";
import { v4 as uuidv4 } from "uuid";

import styles from "./studio_fill.module.scss";

const StudioFill = (props) => {
  const { images } = props;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [areas, setAreas] = React.useState([]);
  const [newAreas, setNewAreas] = React.useState(Array(images.length).fill([]));
  const [parameters, setParameters] = React.useState([]);
  const [boxColors, setBoxColors] = React.useState([]);
  const [extractedTextList, setExtractedTextList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const imageRef = React.createRef();
  const canvasRef = React.createRef();
  const { data: state, setFormState } = useStore();
  const [openModal, setOpenModal] = React.useState(false);
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
  const [activeAreaIndex, setActiveAreaIndex] = React.useState(0);

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
    setExtractedTextList((prevState) => [
      ...prevState.filter((_, id) => idx !== id),
    ]);
    setParameters((prevState) => [...prevState.filter((_, id) => idx !== id)]);
  };

  const onChangeParameter = (value, idx) => {
    const newParameters = [...parameters];
    newParameters[idx] = value;
    setParameters(newParameters);
    const newBoxColors = [...boxColors];
    if (value === "question") {
      // newBoxColors[idx] = "red";
      newBoxColors[idx] = "#800080";
    } else if (value === "correctanswer") {
      newBoxColors[idx] = "#FFA500";
    }
    setBoxColors(newBoxColors);

    onClickExtract(newParameters);
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

  const onClickEdit = () => {
    const params = constructFillTheBlankParametersFromKeyValuePairs(extractedTextList);
    setFormState({
      ...state,
      parameters: {
        ...params,
      },
    });
    setOpenModal(true);
    // navigate("/add-question/multiple-choice/manual");
  };

  const onClickSubmit = async () => {
    console.log("extractedTextList= ", extractedTextList);
    console.log("state= ", state);

    const objectElements = extractedTextList.map((item) => ({
      [item.parameter]: item.text,
    }));

    const res = await axios.post(`saveObject${state.type}/${state.id}`, {
      objectElements,
    });

    toast.success("Question parameters updated successfully!");
  };

  const onEditText = (id, text) => {
    const newExtractedTextList = extractedTextList.map((item) => {
      if (item.id === id) {
        item.text = text;
      }
      return item;
    });
    setExtractedTextList(newExtractedTextList);
  };

  const onClickExtract = async (newParameters) => {
    if (loading) return;
    setLoading(true);
    const image = imageRef.current;
    const ratio = image.naturalWidth / image.width;

    setExtractedTextList([]);

    await Promise.all(
      areas.map(async (area, idx) => {
        const x = area.x * ratio;
        const y = area.y * ratio;
        const width = area.width * ratio;
        const height = area.height * ratio;
        const text = await extract(x, y, width, height, newParameters[idx]);
      })
    );
    setLoading(false);
    setExtractedTextList((prevState) => [
      ...prevState.sort((a, b) => a.y - b.y),
    ]);
  };

  const extract = async (x, y, width, height, parameter) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    const ctx2 = canvas.getContext("2d");
    const finalImage = ctx2.getImageData(0, 0, canvas.width, canvas.height);
    ctx2.putImageData(finalImage, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      const result = await Tesseract.recognize(dataUrl, "eng");
      let text = result.data.text;
      setExtractedTextList((prevState) => [
        ...prevState,
        { id: uuidv4(), text, parameter, y },
      ]);
      return text;
    } catch (err) {
      console.error(err);
    }
    // SORT

    return "";
  };

  return (
    <>
      <Modal show={openModal} onHide={() => setOpenModal(false)}>
        <EditParametersModal handleClose={() => setOpenModal(false)} />
      </Modal>
      <div className="container">
        <div className={styles.studio}>
          <div className={styles.thumbnails}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={img}
                width="200"
                onClick={() => onClickImage(idx)}
              />
            ))}
          </div>
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
                extractedTextList={extractedTextList}
                onEditText={onEditText}
                onClickDeleteArea={() => onClickDeleteArea(idx)}
              />
            ))}
            {extractedTextList.length > 0 && (
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
      </div>
    </>
  );
};

export default StudioFill;
