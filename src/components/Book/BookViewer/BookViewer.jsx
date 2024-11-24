import React from "react";
import { PAGES } from "../../../utils/book";
import BookViewerTopBar from "../BookViewerTopBar/BookViewerTopBar";

import styles from "./bookViewer.module.scss";

const BookViewer = (props) => {
  const { activePage, onChangePage, onClickArea, newPages } = props;

  // const page = PAGES.find((item) => item.id === activePage.id);
  const areas = activePage?.blocks;
  console.log("areas= ", areas);

  return (
    <div className={styles["book-viewer"]}>
      <BookViewerTopBar
        activePage={activePage}
        onChangePage={onChangePage}
        pages={newPages}
      />
      <div className={styles["viewer-box"]}>
        {activePage && <img src={activePage.url} alt={activePage.url} />}
        {areas?.map((area) => (
          <button
            key={area.blockId}
            className={styles["area-button"]}
            style={{
              position: "absolute",
              top: `${area.coordinates.y}px`,
              left: `${area.coordinates.x}px`,
              width: `${area.coordinates.width}px`,
              height: `${area.coordinates.height}px`,
            }}
            onClick={() => onClickArea(area)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default BookViewer;
