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
      {columns?.map((column) =>
        column.minimized ? (
          <div key={column.id} className={styles.minimized}>
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
          <div key={column.id} className={clsx(styles.opened, classNameOpened)}>
            <div className={styles.action}>
              <p>{column.label}</p>
              <button onClick={() => onClickMinimize(column.id)}>
                <MinimizeIcon />
              </button>
            </div>
            {children}
          </div>
        )
      )}
    </div>
  );
};

export default BookColumn;