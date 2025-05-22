import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import { constructBoxColors } from "../../../utils/ocr";
import clsx from "clsx";
/** @jsxImportSource @emotion/react */

import styles from "./studioAreaSelector.module.scss";

const StudioAreaSelector = React.forwardRef((props, ref) => {
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
    showVB,
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
      className={clsx(
        styles["studio-area-selector"],
        !showVB && styles["show"]
      )}
    >
      <div>block 1</div>
      <div>block 2</div>
      <div>block 3</div>
      <div>block 4</div>
      <div>block 5</div>
      <div>block 6</div>
      <div>block 7</div>
      <div>block 8</div>
      <div>block 9</div>
      <div>block 10</div>
      <div>block 11</div>
      <div>block 12</div>
      <div>block 12</div>
      <div>block 12</div>
      <div>block 12</div>
      <div>block 12</div>
      <div>block 12</div>
      <div>block 12</div>
      <div
        className={styles.block}
        css={constructBoxColors(areasProperties[activePage])}
      >
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
    </div>
  );
});

export default StudioAreaSelector;
