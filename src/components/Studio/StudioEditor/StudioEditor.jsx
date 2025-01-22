import React from "react";
import ImageActions from "../../ImageActions/ImageActions";
import { AreaSelector } from "@bmunozg/react-image-area";
import { constructBoxColors } from "../../../utils/ocr";
/** @jsxImportSource @emotion/react */

import styles from "./studioEditor.module.scss";

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

  const onClickExistedArea = (areaProps) => {
    const newAreasProperties = [...areasProperties];
    const idx = areaProps.areaNumber - 1;
    newAreasProperties[activePage][idx].open =
      !newAreasProperties[activePage][idx].open;
    setAreasProperties(newAreasProperties);
  };

  const customRender = (areaProps) => {
    if (!areaProps.isChanging) {
      return (
        <div
          key={areaProps.areaNumber}
          onClick={() => onClickExistedArea(areaProps)}
        >
          <div className={styles.type}>
            {areasProperties[activePage][areaProps.areaNumber - 1]?.type} -
            {areasProperties[activePage][areaProps.areaNumber - 1]?.label}
          </div>
        </div>
      );
    }
  };

  const onImageLoad = () => {
    props.onImageLoad();
  };
  return (
    <div
      className={styles["studio-editor"]}
      css={{
        "& > div:nth-of-type(2)": constructBoxColors(
          areasProperties[activePage]
        ),
      }}
    >
      <ImageActions
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        activePage={activePage}
        areasProperties={areasProperties}
      />
      <AreaSelector
        areas={areas[activePage]}
        onChange={onChangeHandler}
        wrapperStyle={{
          width: "100%",
          // height: "100%",
          overflow: "scroll",
        }}
        customAreaRenderer={customRender}
        areaProps={{
          onClick: (event, area) => {
            console.log("here");
          },
        }}
        unit="percentage"
      >
        <img
          src={pages[activePage]?.url}
          alt={pages[activePage]?.url || pages[activePage]}
          crossOrigin="anonymous"
          ref={ref}
          style={{
            width: `${imageScaleFactor * 100}%`,
            height: `${imageScaleFactor * 100}%`,
            overflow: "scroll",
          }}
          onLoad={onImageLoad}
        />
      </AreaSelector>
    </div>
  );
});

export default StudioEditor;
