import React from "react";

import styles from "./bookThumnails.module.scss";

const BookThumnails = (props) => {
  const { pages, activePage, setActivePage } = props;

  const onClickButton = (page) => {
    console.log("onClickButton");
    console.log("page= ", page);
    setActivePage(page);
  };

  return (
    <div className={styles["book-thumbnails"]}>
      {pages?.map((page) => (
        <button
          key={page._id}
          onClick={() => onClickButton(page)}
          className={activePage?._id === page?._id ? styles.active : ""}
        >
          <img style={{ width: "100%" }} src={page.url} alt={page.url} />
        </button>
      ))}
    </div>
  );
};

export default BookThumnails;
