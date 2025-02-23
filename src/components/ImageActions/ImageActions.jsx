import React from "react";
import { Button, IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CropIcon from "@mui/icons-material/Crop";
import { useStore } from "../../store/store";

const DEGREE = 0.1;
const ZOOM_IN_FACTOR = 1 + DEGREE;
const ZOOM_OUT_FACTOR = 1 - DEGREE;

const ImageActions = (props) => {
  const {
    imageScaleFactor,
    setImageScaleFactor,
    areas,
    setAreas,
    onClickCrop,
    openModal,
  } = props;

  const { data: state, setFormState } = useStore();

  const onClickZoomIn = () => {
    setImageScaleFactor(imageScaleFactor + DEGREE);
    const newAreas = areas.map((area) => {
      area.x = area.x * ZOOM_IN_FACTOR;
      area.y = area.y * ZOOM_IN_FACTOR;
      area.height = area.height * ZOOM_IN_FACTOR;
      area.width = area.width * ZOOM_IN_FACTOR;
      return area;
    });
    setAreas(newAreas);
  };

  const onClickZoomOut = () => {
    setImageScaleFactor(imageScaleFactor - DEGREE);
    const newAreas = areas.map((area) => {
      area.x = area.x * ZOOM_OUT_FACTOR;
      area.y = area.y * ZOOM_OUT_FACTOR;
      area.height = area.height * ZOOM_OUT_FACTOR;
      area.width = area.width * ZOOM_OUT_FACTOR;
      return area;
    });
    setAreas(newAreas);
  };

  const onClickGPT = () => {
    openModal();
    setFormState({ ...state, modal: "GPT" });
  };

  return (
    <div
      style={{
        borderBottom: "1px solid black",
      }}
    >
      <IconButton aria-label="zoom-in" onClick={onClickZoomIn}>
        <ZoomInIcon fontSize="large" />
      </IconButton>
      <IconButton aria-label="zoom-in" onClick={onClickZoomOut}>
        <ZoomOutIcon fontSize="large" />
      </IconButton>
      {/* <IconButton aria-label="zoom-in" onClick={onClickCrop}>
        <CropIcon fontSize="large" />
      </IconButton> */}
      <span style={{ display: "inline-flex", gap: "2rem", marginLeft: "2rem" }}>
        <Button variant="contained" onClick={onClickCrop}>
          YOLO
        </Button>
        <Button variant="contained" onClick={onClickGPT}>
          GPT
        </Button>
      </span>
    </div>
  );
};

export default ImageActions;
