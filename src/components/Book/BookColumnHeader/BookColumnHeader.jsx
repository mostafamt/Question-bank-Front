import React from "react";
import MinimizeIcon from "@mui/icons-material/Minimize";

import styles from "./bookColumnHeader.module.scss";

const BookColumnHeader = (props) => {
  const { columnName, close } = props;

  return (
    <div className={styles["book-column-header"]}>
      <span>{columnName}</span>
      <button onClick={close}>
        <MinimizeIcon />
      </button>
    </div>
  );
};

export default BookColumnHeader;
