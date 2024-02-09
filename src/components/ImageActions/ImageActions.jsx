import React from "react";
import { IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const DEGREE = 0.1;
const ZOOM_IN_FACTOR = 1 + DEGREE;
const ZOOM_OUT_FACTOR = 1 - DEGREE;

const ImageActions = (props) => {
  const { imageScaleFactor, setImageScaleFactor, areas, setAreas } = props;

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
    </div>
  );
};

export default ImageActions;
