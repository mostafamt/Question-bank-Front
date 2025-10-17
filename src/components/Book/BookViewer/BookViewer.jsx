import React from "react";
import { PAGES } from "../../../utils/book";
import BookViewerTopBar from "../BookViewerTopBar/BookViewerTopBar";

import styles from "./bookViewer.module.scss";
import { parseVirtualBlocksFromActivePage } from "../../../utils/virtual-blocks";
import VirtualBlock from "../../VirtualBlocks/VirtualBlock/VirtualBlock";
import { getImageDimensions } from "../../../utils/image";

const BookViewer = (props) => {
  const {
    activePage,
    onChangePage,
    onClickArea,
    newPages: pages,
    onChangeActivePage,
  } = props;
  const [width, setWidth] = React.useState(null);
  const [showVB, setShowVB] = React.useState(false);
  const ref = React.createRef(null);

  const areas = activePage?.blocks;

  let virtualBlocks = parseVirtualBlocksFromActivePage(activePage);

  // React.useEffect(() => {
  //   // console.log("ref= ", ref?.current?.clientWidth);
  //   console.log("activePage= ", activePage);
  //   getImageDimensions(activePage.url)
  //     .then((dimensions) => {})
  //     .catch((error) => {
  //       console.error(error.message);
  //     });
  // }, [activePage.url, ref, ref.current?.clientWidth]);

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
        onChangeActivePage={onChangeActivePage}
      />
      <div
        className={styles.blocks}
        style={{ display: showVB ? "grid" : "block" }}
      >
        {virtualBlocksRenders}
        <div
          className={styles["viewer-box"]}
          style={{
            gridColumn: showVB ? "2 / 6" : "1 / 8",
            gridRow: showVB ? "2 / 8" : "1 / 8",
            backgroundImage: `url(${activePage?.url})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: showVB ? "94%" : "99%",
          }}
          ref={ref}
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
