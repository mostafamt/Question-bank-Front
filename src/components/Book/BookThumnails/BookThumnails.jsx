import React from "react";

import styles from "./bookThumnails.module.scss";

const BookThumnails = (props) => {
  const { pages, activePage, setActivePage } = props;

  React.useEffect(() => {
    localStorage.setItem("page", JSON.stringify(activePage));
  }, []);

  const onClickButton = (page) => {
    // console.log("page= ", page);
    // console.log("page= ", page);
    setActivePage(page);
    localStorage.setItem("page", JSON.stringify(page));
  };

  return (
    <div className={styles["book-thumbnails"]}>
      {pages?.map((page) => (
        <button
          key={page._id}
          onClick={() => onClickButton(page)}
          className={
            JSON.parse(localStorage.getItem("page"))?._id === page?._id
              ? styles.active
              : ""
          }
        >
          <img style={{ width: "100%" }} src={page.url} alt={page.url} />
        </button>
      ))}
    </div>
  );
};

export default BookThumnails;
