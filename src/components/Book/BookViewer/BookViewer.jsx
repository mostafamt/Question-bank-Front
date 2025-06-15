import React from "react";
import { PAGES } from "../../../utils/book";
import BookViewerTopBar from "../BookViewerTopBar/BookViewerTopBar";

import styles from "./bookViewer.module.scss";

const BookViewer = (props) => {
  const { activePage, onChangePage, onClickArea, newPages } = props;
  const [width, setWidth] = React.useState(null);
  const [showVB, setShowVB] = React.useState(false);

  // const page = PAGES.find((item) => item.id === activePage.id);
  const areas = activePage?.blocks;
  // const [areas, setAreas] = React.useState(activePage?.blocks);

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

  const virtualBlocks = Array(18).fill(null);

  return (
    <div className={styles["book-viewer"]}>
      <BookViewerTopBar
        activePage={activePage}
        onChangePage={onChangePage}
        pages={newPages}
        showVB={showVB}
        setShowVB={setShowVB}
      />
      <div className={styles.blocks}>
        {virtualBlocks.map((_, idx) => (
          <div key={idx} style={{ display: showVB ? "block" : "none" }}>
            box {idx + 1}
          </div>
        ))}
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
