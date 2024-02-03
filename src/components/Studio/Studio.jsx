import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForever from "@mui/icons-material/DeleteForever";
import { Button, IconButton } from "@mui/material";
import MuiSelect from "../MuiSelect/MuiSelect";
import OCR from "../../utils/OCR/OCR";
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useStore } from "../../store/store";
import { constructMCQParametersFromKeyValuePairs } from "../../utils/helper";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { toast } from "react-toastify";

import styles from "./studio.module.scss";
import Modal from "../Modal/Modal";
import EditParametersModal from "../Modal/EditParametersModal/EditParametersModal";

const Studio = (props) => {
  const { images, params } = props;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [areas, setAreas] = React.useState([]);
  const [parameters, setParameters] = React.useState([]);
  const [boxColors, setBoxColors] = React.useState([]);
  const [extractedTextList, setExtractedTextList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const imageRef = React.createRef();
  const navigate = useNavigate();
  const { data: state, setFormState } = useStore();
  const [openModal, setOpenModal] = React.useState(false);

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

  const onClickDeleteArea = () => {
    areas.pop();
    setAreas([...areas]);
    boxColors.pop();
    setBoxColors([...boxColors]);
  };

  const onClickDeleteAreas = () => {
    setAreas([]);
    setBoxColors([]);
    setParameters([]);
    setExtractedTextList([]);
  };

  const onChangeSelect = (value, idx) => {
    const newParameters = [...parameters];
    newParameters[idx] = value;
    setParameters(newParameters);
    const newBoxColors = [...boxColors];
    if (value === "question") {
      newBoxColors[idx] = "purple";
    } else if (value === "option") {
      newBoxColors[idx] = "orange";
    }
    setBoxColors(newBoxColors);
    console.log(parameters);
  };

  const constructBoxColors = () => {
    console.log(boxColors);
    const values = boxColors.map((a, idx) => `& > div:nth-child(${idx + 2})`);

    const obj = boxColors.map((color, idx) => {
      if (values[idx]) {
        return {
          [values[idx]]: {
            border: `2px solid ${color} !important`,
          },
        };
      } else {
        return {};
      }
    });

    return obj;
  };

  const sortedExtractedTextList = extractedTextList.sort((a, b) => a.y - b.y);

  const onClickEdit = () => {
    console.log("onClickEdit");
    console.log("parameters= ", parameters);

    const params = constructMCQParametersFromKeyValuePairs(
      sortedExtractedTextList
    );

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
    const params = constructMCQParametersFromKeyValuePairs(
      sortedExtractedTextList
    );

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
              "& > div:first-child": constructBoxColors(),
            }}
          >
            <AreaSelector areas={areas} onChange={onChangeHandler}>
              <img
                src={images[activeIndex]}
                alt={images[activeIndex]}
                ref={imageRef}
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
            <div className={styles["action-icons"]}>
              <IconButton aria-label="delete" onClick={onClickDeleteArea}>
                <DeleteIcon />
              </IconButton>
              <IconButton aria-label="delete" onClick={onClickDeleteAreas}>
                <DeleteForever />
              </IconButton>
            </div>
            {areas.map((area, idx) => (
              <div key={area}>
                <MuiSelect
                  params={params}
                  value={parameters[idx]}
                  color={boxColors[idx]}
                  onChange={(e) => onChangeSelect(e.target.value, idx)}
                />
                <p>
                  {loading
                    ? "loading text...."
                    : sortedExtractedTextList?.[idx]?.text}
                </p>
              </div>
            ))}
            {sortedExtractedTextList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <Button variant="contained" onClick={onClickEdit}>
                  Edit
                </Button>
                <Button variant="contained" onClick={onClickSubmit}>
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
