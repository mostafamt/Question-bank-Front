import React from "react";
import ImageActions from "../../ImageActions/ImageActions";

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
  } = props;

  if (!show) return;

  return (
    <div
      style={{
        position: "fixed",
        background: "#fff",
        color: "#fff",
        top: "0",
        left: "50%",
        width: "37.5%",
        transform: "translate(-50%, 0)",
        zIndex: 1,
      }}
    >
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
      />
    </div>
  );
};

export default StudioStickyToolbar;
