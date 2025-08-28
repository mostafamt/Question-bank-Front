import React from "react";

import styles from "./bookThumnails.module.scss";

const BookThumnails = React.forwardRef((props, ref) => {
  const { pages, activePage, setActivePage, onChangeActivePage } = props;
  const containerRef = React.useRef(null);

  const onClickButton = (page) => {
    setActivePage(page);
    ref.current?.scrollBy({ top: 200, behavior: "smooth" });
  };

  return (
    <div className={styles["book-thumbnails"]} ref={containerRef}>
      {pages?.map((page) => (
        <button
          key={page._id}
          onClick={() => onChangeActivePage(page)}
          className={activePage?._id === page?._id ? styles.active : ""}
        >
          <img style={{ width: "100%" }} src={page.url} alt={page.url} />
        </button>
      ))}
    </div>
  );
});

export default BookThumnails;
