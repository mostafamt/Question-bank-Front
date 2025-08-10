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
    showVB,
    onClickToggleVirutalBlocks,
    onClickImage,
    activeRightTab,
  } = props;

  const studioEditorSelectorRef = React.useRef(null);
  const imageActionsRef = React.useRef(null);

  React.useImperativeHandle(ref, () => {
    return {
      studioEditorSelectorRef: studioEditorSelectorRef,
      imageActionsRef: imageActionsRef,
    };
  });

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
        onImageLoad={onImageLoad}
        ref={imageActionsRef}
        pages={pages}
        onClickImage={onClickImage}
      />
      <StudioAreaSelector
        {...props}
        showVB={showVB}
        ref={studioEditorSelectorRef}
      />
    </div>
  );
});

export default StudioEditor;
