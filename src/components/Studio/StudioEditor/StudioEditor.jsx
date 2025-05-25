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
    onImageLoad,
    checkedObject,
    setCheckedObject,
  } = props;
  const [showVB, setShowVB] = React.useState(false);

  const onClickToggleVirutalBlocks = () => {
    setShowVB((prevState) => !prevState);
    setTimeout(() => {
      onImageLoad();
    }, 20);
  };

  return (
    <div className={styles["studio-editor"]}>
      <ImageActions
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        activePage={activePage}
        areasProperties={areasProperties}
        showVB={showVB}
        onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
      />
      <StudioAreaSelector {...props} showVB={showVB} ref={ref} />
    </div>
  );
});

export default StudioEditor;
