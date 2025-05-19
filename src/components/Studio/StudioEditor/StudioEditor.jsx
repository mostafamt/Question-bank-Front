import React from "react";
import ImageActions from "../../ImageActions/ImageActions";
import { AreaSelector } from "@bmunozg/react-image-area";
import { constructBoxColors } from "../../../utils/ocr";
/** @jsxImportSource @emotion/react */

import styles from "./studioEditor.module.scss";
import StudioAreaSelector from "../StudioAreaSelector/StudioAreaSelector";

const StudioEditor = React.forwardRef((props, ref) => {
  const {
    areasProperties,
    setAreasProperties,
    activePage,
    imageScaleFactor,
    setImageScaleFactor,
    areas,
    setAreas,
    onChangeHandler,
    pages,
  } = props;

  return (
    <div className={styles["studio-editor"]}>
      <ImageActions
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        activePage={activePage}
        areasProperties={areasProperties}
      />
      <StudioAreaSelector {...props} ref={ref} />
    </div>
  );
});

export default StudioEditor;
