import React from "react";
import ImageActions from "../../ImageActions/ImageActions";
import { AreaSelector } from "@bmunozg/react-image-area";
import { DELETED, constructBoxColors } from "../../../utils/ocr";
/** @jsxImportSource @emotion/react */

import styles from "./studioEditor.module.scss";

const StudioEditor = (props) => {
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
    imageRef,
  } = props;

  const newAreas =
    areas[activePage].filter(
      (_, idx) => areasProperties[activePage][idx]?.status !== DELETED
    ) || [];

  const customRender = (areaProps) => {
    if (!areaProps.isChanging) {
      return (
        <div key={areaProps.areaNumber} className={styles.type}>
          {areasProperties[activePage][areaProps.areaNumber - 1]?.type} -
          {areasProperties[activePage][areaProps.areaNumber - 1]?.label}
        </div>
      );
    }
  };

  return (
    <div
      className={styles["studio-editor"]}
      css={{
        "& > div:nth-of-type(2)": constructBoxColors(
          areasProperties[activePage]
        ),
        // "&::before": {
        //   content: '"Before from jsx - "',
        // },
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
          height: "95%",
          overflow: "scroll",
        }}
        customAreaRenderer={customRender}
      >
        <img
          src={pages[activePage]?.url}
          alt={pages[activePage]?.url || pages[activePage]}
          crossOrigin="anonymous"
          ref={imageRef}
          style={{
            width: `${imageScaleFactor * 100}%`,
            height: `${imageScaleFactor * 100}%`,
            overflow: "scroll",
          }}
        />
      </AreaSelector>
    </div>
  );
};

export default StudioEditor;
