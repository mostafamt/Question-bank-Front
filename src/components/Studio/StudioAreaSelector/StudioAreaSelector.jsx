import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import { constructBoxColors } from "../../../utils/ocr";
import clsx from "clsx";
/** @jsxImportSource @emotion/react */

import styles from "./studioAreaSelector.module.scss";
import VirtualBlocks from "../../VirtualBlocks/VirtualBlocks";

const StudioAreaSelector = React.forwardRef((props, ref) => {
  const {
    areasProperties,
    setAreasProperties,
    activePage,
    imageScaleFactor,
    areas,
    onChangeHandler,
    pages,
    showVB,
    openModal,
    setModalName,
    virtualBlocks,
    setVirtualBlocks,
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
    <VirtualBlocks
      className={clsx(
        styles["studio-area-selector"],
        !showVB && styles["show"]
      )}
      showVB={showVB}
      virtualBlocks={virtualBlocks}
      setVirtualBlocks={setVirtualBlocks}
      activePage={activePage}
      openModal={openModal}
      setModalName={setModalName}
    >
      <div
        className={styles.block}
        css={constructBoxColors(areasProperties[activePage])}
      >
        <AreaSelector
          areas={areas[activePage]}
          onChange={onChangeHandler}
          wrapperStyle={{
            width: "100%",
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
    </VirtualBlocks>
  );
});

export default StudioAreaSelector;
