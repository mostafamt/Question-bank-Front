import React from "react";
import { IconButton, Typography } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import BackHandIcon from "@mui/icons-material/BackHand";

import styles from "./styles.module.scss";

const DEGREE = 0.1;
// large | medium | small
const iconFontSize = "large";
// const text

const ImageActions = React.forwardRef((props, ref) => {
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
    pages,
    onClickImage,
    highlight,
    setHighlight,
  } = props;

  const [oldAreas, setOldAreas] = React.useState(areas[activePage] || []);

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

  const onClickZoomOff = () => {
    // setImageScaleFactor(imageScaleFactor + DEGREE);
    // const newAreas = [...areas];
    // newAreas[activePage] = areas[activePage].map((area, idx) => {
    //   const { x, y, width, height } = areasProperties[activePage][idx];
    //   area.x = area.x + oldAreas[idx].x * DEGREE;
    //   area.y = area.y + oldAreas[idx].y * DEGREE;
    //   area.height = area.height + oldAreas[idx].height * DEGREE;
    //   area.width = area.width + oldAreas[idx].width * DEGREE;
    //   return area;
    // });
    // setAreas(newAreas);
    // setTimeout(() => {
    //   onImageLoad();
    // }, 1);
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

  const onClickFirstPage = () => {
    onClickImage(0);
  };

  const onClickPreviousPage = () => {
    if (activePage - 1 >= 0) {
      onClickImage(activePage - 1);
    }
  };

  const onClickNextPage = () => {
    if (activePage + 1 < pages.length) {
      onClickImage(activePage + 1);
    }
  };

  const onClickLastPage = () => {
    onClickImage(pages.length - 1);
  };

  return (
    <div className={styles["image-actions"]} ref={ref}>
      <div>
        <Typography variant="caption" component="h5" sx={{ color: "#212529" }}>
          Page {activePage + 1} of {pages?.length}
        </Typography>
        <IconButton aria-label="first" onClick={onClickFirstPage}>
          <FirstPageIcon fontSize={iconFontSize} />
        </IconButton>
        <IconButton aria-label="previous" onClick={onClickPreviousPage}>
          <KeyboardArrowLeftIcon fontSize={iconFontSize} />
        </IconButton>
        <IconButton aria-label="next" onClick={onClickNextPage}>
          <KeyboardArrowRightIcon fontSize={iconFontSize} />
        </IconButton>
        <IconButton aria-label="last" onClick={onClickLastPage}>
          <LastPageIcon fontSize={iconFontSize} />
        </IconButton>
      </div>
      <div>
        <span>|</span>
      </div>

      <div>
        <IconButton
          aria-label="hand"
          onClick={() => setHighlight(highlight === "hand" ? "" : "hand")}
          sx={{
            backgroundColor: highlight === "hand" ? "#ccc" : "transparent",
          }}
        >
          <BackHandIcon fontSize={iconFontSize} />
        </IconButton>
      </div>

      <div>
        <span>|</span>
      </div>

      <div>
        <IconButton aria-label="zoom-in" onClick={onClickZoomIn}>
          <ZoomInIcon fontSize={iconFontSize} />
        </IconButton>

        <IconButton aria-label="zoom-off" onClick={onClickZoomOff}>
          <SearchOffIcon fontSize={iconFontSize} />
        </IconButton>

        <IconButton aria-label="zoom-out" onClick={onClickZoomOut}>
          <ZoomOutIcon fontSize={iconFontSize} />
        </IconButton>
      </div>
      <div>
        <span>|</span>
      </div>

      <div>
        <IconButton
          aria-label="visibility-icon"
          onClick={onClickToggleVirutalBlocks}
        >
          {showVB ? (
            <VisibilityIcon fontSize={iconFontSize} />
          ) : (
            <VisibilityOffIcon fontSize={iconFontSize} />
          )}
        </IconButton>
      </div>
    </div>
  );
});

export default ImageActions;
