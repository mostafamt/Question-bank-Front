import React from "react";
import { PAGES } from "../../../utils/book";
import BookViewerTopBar from "../BookViewerTopBar/BookViewerTopBar";

import styles from "./bookViewer.module.scss";
import { parseVirtualBlocksFromActivePage } from "../../../utils/virtual-blocks";
import VirtualBlock from "../../VirtualBlocks/VirtualBlock/VirtualBlock";

const BookViewer = (props) => {
  const { activePage, onChangePage, onClickArea, newPages: pages } = props;
  const [width, setWidth] = React.useState(null);
  const [showVB, setShowVB] = React.useState(false);

  const areas = activePage?.blocks;

  let virtualBlocks = parseVirtualBlocksFromActivePage(activePage);

  console.log("virtualBlocks= ", virtualBlocks);

  React.useEffect(() => {
    console.log("change width");
  }, []);

  const getStyle = (area) => {
    if (area?.coordinates?.unit === "percentage") {
      return {
        position: "absolute",
        top: `${area.coordinates.y}%`,
        left: `${area.coordinates.x}%`,
        width: `${area.coordinates.width}%`,
        height: `${area.coordinates.height}%`,
      };
    } else {
      return {
        position: "absolute",
        top: `${area.coordinates.y}px`,
        left: `${area.coordinates.x}px`,
        width: `${area.coordinates.width}px`,
        height: `${area.coordinates.height}px`,
      };
    }
  };

  // const virtualBlocks = Array(18).fill(null);

  const virtualBlocksRenders = [];

  for (const label in virtualBlocks) {
    virtualBlocksRenders.push(
      <VirtualBlock
        key={`${label}`}
        label={label}
        // openModal={openModal}
        // setModalName={setModalName}
        checkedObject={virtualBlocks[label]}
        showVB={showVB}
        reader
      />
    );
  }

  return (
    <div className={styles["book-viewer"]}>
      <BookViewerTopBar
        activePage={activePage}
        onChangePage={onChangePage}
        pages={pages}
        showVB={showVB}
        setShowVB={setShowVB}
      />
      <div className={styles.blocks}>
        {virtualBlocksRenders}
        <div
          className={styles["viewer-box"]}
          style={{
            gridColumn: showVB ? "2 / 6" : "1 / 8",
            gridRow: showVB ? "2 / 8" : "1 / 8",
            backgroundImage: `url(${activePage.url})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            height: showVB ? "37rem" : "100%",
          }}
        >
          {/* {activePage && <img src={activePage.url} alt={activePage.url} />} */}
          {areas?.map((area) => (
            <button
              key={area.blockId}
              className={styles["area-button"]}
              style={getStyle(area)}
              onClick={() => onClickArea(area)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookViewer;
