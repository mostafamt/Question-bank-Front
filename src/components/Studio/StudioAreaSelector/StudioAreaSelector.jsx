import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import { constructBoxColors } from "../../../utils/ocr";
import clsx from "clsx";
/** @jsxImportSource @emotion/react */
import VirtualBlock from "../../VirtualBlock/VirtualBlock";

import styles from "./studioAreaSelector.module.scss";

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

  const virtualBlocksRenders = [];

  for (const label in virtualBlocks) {
    virtualBlocksRenders.push(
      <VirtualBlock
        key={label}
        label={label}
        openModal={openModal}
        setModalName={setModalName}
        checkedObject={virtualBlocks[label]}
        setCheckedObject={(value) => {
          const newVirtualBlocks = { ...virtualBlocks };
          newVirtualBlocks[label] = value;
          setVirtualBlocks(newVirtualBlocks);
        }}
      />
    );
  }

  return (
    <div
      className={clsx(
        styles["studio-area-selector"],
        !showVB && styles["show"]
      )}
    >
      {virtualBlocksRenders}
      <div
        className={styles.block}
        css={constructBoxColors(areasProperties[activePage])}
      >
        <AreaSelector
          areas={areas[activePage]}
          onChange={onChangeHandler}
          wrapperStyle={{
            width: "100%",
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
