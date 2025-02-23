import React from "react";
import { PAGES } from "../../../utils/book";
import BookViewerTopBar from "../BookViewerTopBar/BookViewerTopBar";

import styles from "./bookViewer.module.scss";

const BookViewer = (props) => {
  const { activePage, onChangePage, onClickArea, newPages } = props;
  const [width, setWidth] = React.useState(null);

  // const page = PAGES.find((item) => item.id === activePage.id);
  const areas = activePage?.blocks;
  // const [areas, setAreas] = React.useState(activePage?.blocks);
  const imageRef = React.useRef(null);

  React.useEffect(() => {
    console.log("change width");
  }, []);

  const getStyle = (area) => {
    // console.log("imageRef= ", imageRef);

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

  return (
    <div className={styles["book-viewer"]}>
      <BookViewerTopBar
        activePage={activePage}
        onChangePage={onChangePage}
        pages={newPages}
      />
      <div className={styles["viewer-box"]}>
        {activePage && (
          <img src={activePage.url} alt={activePage.url} ref={imageRef} />
        )}
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
  );
};

export default BookViewer;
