import React from "react";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import styles from "./bookColumn.module.scss";

const BookColumn = (props) => {
  const { column, onClickMinimize, children } = props;

  return (
    <div
      className={styles["book-column"]}
      style={{
        flex: `0 0 ${column.percentage}%`,
      }}
    >
      {column.minimized ? (
        <div className={styles.minimized}>
          <div>
            <button
              onClick={() => onClickMinimize(column.id)}
              className={styles["rotated-button"]}
            >
              {column.label}
              <ContentCopyIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.opened}>
          <div className={styles.action}>
            <p>{column.label}</p>
            <button onClick={() => onClickMinimize(column.id)}>
              <MinimizeIcon />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};

export default BookColumn;
