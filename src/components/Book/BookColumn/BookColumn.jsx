import React from "react";
import BookColumnHeader from "../BookColumnHeader/BookColumnHeader";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import styles from "./bookColumn.module.scss";

const BookColumn = (props) => {
  const { COLUMNS, activeColumn, onImageLoad } = props;
  const [activeTab, setActiveTab] = React.useState(activeColumn.label);

  const onChangeActiveTab = (tab) => {
    setActiveTab(tab);
    setTimeout(() => {
      onImageLoad();
    }, 50);
  };

  let content = <></>;
  if (activeTab) {
    COLUMNS.forEach((column) => {
      if (column.label === activeTab) {
        content = (
          <div>
            <BookColumnHeader
              columnName={column.label}
              close={() => onChangeActiveTab("")}
            />
            {column.component}
          </div>
        );
      }
    });
  } else {
    content = (
      <div className={styles["tabs"]}>
        {COLUMNS.map((column) => (
          <button
            key={column.id}
            onClick={() => onChangeActiveTab(column.label)}
          >
            <span>{column.label}</span>
            <ContentCopyIcon />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={styles["book-column"]}
      style={
        activeTab
          ? { flex: `0 0 ${20}%` }
          : { flex: `0 0 2.6%`, overflow: "hidden" }
      }
    >
      {content}
    </div>
  );
};

export default BookColumn;
