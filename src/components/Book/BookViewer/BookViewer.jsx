import React from "react";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import styles from "./bookViewer.module.scss";
import { PAGES } from "../../../utils/book";

const BookViewer = (props) => {
  const { activePage, onChangePage, onClickArea } = props;

  const onClickNextPage = () => {
    onChangePage("next");
  };
  const onClickPreviousPage = () => {
    onChangePage("previous");
  };

  const page = PAGES.find((item) => item.id === activePage.id);
  console.log("page= ", page);
  const areas = page.areas;

  return (
    <div className={styles["book-viewer"]}>
      <div className={styles.actions}>
        <button onClick={onClickPreviousPage}>
          <KeyboardArrowLeftIcon />
        </button>
        <button onClick={onClickNextPage}>
          <KeyboardArrowRightIcon />
        </button>
      </div>
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
