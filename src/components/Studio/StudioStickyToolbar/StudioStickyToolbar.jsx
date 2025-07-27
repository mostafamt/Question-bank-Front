import React from "react";
import ImageActions from "../../ImageActions/ImageActions";

import styles from "./studioStickyToolbar.module.scss";

const StudioStickyToolbar = (props) => {
  const {
    show,
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
  } = props;

  if (!show) return;

  return (
    <div className={styles["studio-sticky-toolbar"]}>
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
        pages={pages}
        onClickImage={onClickImage}
      />
    </div>
  );
};

export default StudioStickyToolbar;
