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
  constructMCQParametersFromKeyValuePairs,
  hexToRgbA,
} from "../../utils/helper";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { toast } from "react-toastify";
import Modal from "../Modal/Modal";
import EditParametersModal from "../Modal/EditParametersModal/EditParametersModal";
import AreaActions from "../AreaActions/AreaActions";

import styles from "./studio.module.scss";
import ImageActions from "../ImageActions/ImageActions";

const Studio = (props) => {
  const { images } = props;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [areas, setAreas] = React.useState([]);
  const [parameters, setParameters] = React.useState([]);
  const [boxColors, setBoxColors] = React.useState([]);
  const [extractedTextList, setExtractedTextList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const imageRef = React.createRef();
  const { data: state, setFormState } = useStore();
  const [openModal, setOpenModal] = React.useState(false);
  const [imageScaleFactor, setImageScaleFactor] = React.useState(1);

  const onClickImage = (idx) => {
    setActiveIndex(idx);
  };

  const onChangeHandler = (areasParam) => {
    if (areasParam.length > areas.length) {
      setBoxColors([...boxColors, null]);
      setParameters([...parameters, ""]);
    }
    setAreas(areasParam);
  };

  const onClickDeleteArea = (idx) => {
    setAreas((prevState) => [...prevState.filter((_, id) => idx !== id)]);
    setBoxColors((prevState) => [...prevState.filter((_, id) => idx !== id)]);
  };

  const onChangeParameter = (value, idx) => {
    const newParameters = [...parameters];
    newParameters[idx] = value;
    setParameters(newParameters);
    const newBoxColors = [...boxColors];
    if (value === "question") {
      // newBoxColors[idx] = "red";
      newBoxColors[idx] = "#800080";
    } else if (value === "option") {
      newBoxColors[idx] = "#FFA500";
    }
    setBoxColors(newBoxColors);
    console.log(parameters);
  };

  const constructBoxColors = () => {
    console.log("constructBoxColors");
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

    console.log("obj= ", obj);

    return obj;
  };

  const onClickEdit = () => {
    console.log("onClickEdit");
    console.log("parameters= ", parameters);

    const params = constructMCQParametersFromKeyValuePairs(extractedTextList);

    console.log("params= ", params);

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
    const params = constructMCQParametersFromKeyValuePairs(extractedTextList);

    const data = {
      ...state,
      isAnswered: "g",
      parameters: { ...params },
    };
    await axios.post("/interactive-objects", {
      ...data,
    });
    toast.success("Question created successfully!");
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
              <OCR
                ref={imageRef}
                areas={areas}
                parameters={parameters}
                setExtractedTextList={setExtractedTextList}
                loading={loading}
                setLoading={setLoading}
              />
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

export default Studio;
