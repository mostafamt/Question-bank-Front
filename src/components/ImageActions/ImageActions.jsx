import React from "react";
import { IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const DEGREE = 0.1;

const ImageActions = (props) => {
  const {
    imageScaleFactor,
    setImageScaleFactor,
    areas,
    setAreas,
    activePage,
    areasProperties,
  } = props;

  const onClickZoomIn = () => {
    setImageScaleFactor(imageScaleFactor + DEGREE);
    const newAreas = [...areas];
    newAreas[activePage] = areas[activePage].map((area, idx) => {
      const { x, y, width, height } = areasProperties[activePage][idx];
      area.x = area.x + x * DEGREE;
      area.y = area.y + y * DEGREE;
      area.height = area.height + height * DEGREE;
      area.width = area.width + width * DEGREE;
      return area;
    });
    setAreas(newAreas);
  };

  const onClickZoomOut = () => {
    setImageScaleFactor(imageScaleFactor - DEGREE);
    const newAreas = [...areas];
    newAreas[activePage] = areas[activePage].map((area, idx) => {
      const { x, y, width, height } = areasProperties[activePage][idx];
      area.x = area.x - x * DEGREE;
      area.y = area.y - y * DEGREE;
      area.height = area.height - height * DEGREE;
      area.width = area.width - width * DEGREE;
      return area;
    });
    setAreas(newAreas);
  };

  return (
    <div
      style={{
        borderBottom: "1px solid black",
        height: "5%",
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
