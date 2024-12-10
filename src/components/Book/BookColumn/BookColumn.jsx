import React from "react";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import styles from "./bookColumn.module.scss";
import clsx from "clsx";

const BookColumn = (props) => {
  const { column, columns, onClickMinimize, children, classNameOpened } = props;

  return (
    <div
      className={styles["book-column"]}
      style={{
        flex: `0 0 ${column.percentage}%`,
      }}
    >
      {column.minimized ? (
        <div className={styles.minimized}>
          {columns?.map((item) => (
            <div>
              <button
                onClick={() => onClickMinimize(column.id)}
                className={styles["rotated-button"]}
              >
                {item}
                <ContentCopyIcon />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={clsx(styles.opened, classNameOpened)}>
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
