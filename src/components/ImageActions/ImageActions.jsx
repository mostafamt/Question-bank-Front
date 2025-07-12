import React from "react";
import { IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const DEGREE = 0.1;

const ImageActions = (props) => {
  const {
    imageScaleFactor,
    setImageScaleFactor,
    areas,
    setAreas,
    activePage,
    areasProperties,
    showVB,
    onClickToggleVirutalBlocks,
    onImageLoad,
  } = props;

  const [oldAreas, setOldAreas] = React.useState(areas[activePage] || []);

  console.log("oldAreas= ", oldAreas);

  const onClickZoomIn = () => {
    setImageScaleFactor(imageScaleFactor + DEGREE);
    const newAreas = [...areas];
    newAreas[activePage] = areas[activePage].map((area, idx) => {
      const { x, y, width, height } = areasProperties[activePage][idx];
      area.x = area.x + oldAreas[idx].x * DEGREE;
      area.y = area.y + oldAreas[idx].y * DEGREE;
      area.height = area.height + oldAreas[idx].height * DEGREE;
      area.width = area.width + oldAreas[idx].width * DEGREE;
      return area;
    });
    setAreas(newAreas);
    setTimeout(() => {
      onImageLoad();
    }, 1);
  };

  const onClickZoomOut = () => {
    setImageScaleFactor(imageScaleFactor - DEGREE);
    const newAreas = [...areas];
    newAreas[activePage] = areas[activePage].map((area, idx) => {
      const { x, y, width, height } = areasProperties[activePage][idx];
      area.x = area.x - oldAreas[idx].x * DEGREE;
      area.y = area.y - oldAreas[idx].y * DEGREE;
      area.height = area.height - oldAreas[idx].height * DEGREE;
      area.width = area.width - oldAreas[idx].width * DEGREE;
      return area;
    });
    setAreas(newAreas);
    setTimeout(() => {
      onImageLoad();
    }, 1);
  };

  return (
    <div
      style={{
        borderBottom: "1px solid black",
        height: "5%",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <IconButton aria-label="zoom-in" onClick={onClickZoomIn}>
          <ZoomInIcon fontSize="large" />
        </IconButton>
        <IconButton aria-label="zoom-out" onClick={onClickZoomOut}>
          <ZoomOutIcon fontSize="large" />
        </IconButton>
      </div>
      <IconButton
        aria-label="zoom-in"
        onClick={onClickToggleVirutalBlocks}
        sx={{ height: "100%" }}
      >
        {showVB ? (
          <VisibilityIcon sx={{ fontSize: 30 }} />
        ) : (
          <VisibilityOffIcon sx={{ fontSize: 30 }} />
        )}
      </IconButton>
    </div>
  );
};

export default ImageActions;
