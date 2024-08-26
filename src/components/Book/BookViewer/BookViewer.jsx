import React from "react";
import { PAGES } from "../../../utils/book";
import BookViewerTopBar from "../BookViewerTopBar/BookViewerTopBar";

import styles from "./bookViewer.module.scss";

const BookViewer = (props) => {
  const { activePage, onChangePage, onClickArea } = props;

  const page = PAGES.find((item) => item.id === activePage.id);
  const areas = page.areas;

  return (
    <div className={styles["book-viewer"]}>
      <BookViewerTopBar onChangePage={onChangePage} />
      <div className={styles["viewer-box"]}>
        {activePage && <img src={activePage.src} alt={activePage.src} />}
        {areas.map((area) => (
          <button
            key={area.id}
            className={styles["area-button"]}
            style={{
              top: `${area.y}%`,
              left: `${area.x}%`,
              height: `${area.height}%`,
              width: `${area.width}%`,
            }}
            onClick={onClickArea}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default BookViewer;
