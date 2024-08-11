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
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onClickButton(page)}
          className={activePage.id === page.id ? styles.active : ""}
        >
          <img style={{ width: "100%" }} src={page.src} alt={page.src} />
        </button>
      ))}
    </div>
  );
};

export default BookThumnails;
