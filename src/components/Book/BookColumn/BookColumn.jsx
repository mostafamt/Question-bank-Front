import React from "react";
import BookColumnHeader from "../BookColumnHeader/BookColumnHeader";
import { getColumnIcon } from "../../../utils/book-icons";
import { getTabLabel } from "../../../utils/tabFiltering";
import { useStore } from "../../../store/store";

import styles from "./bookColumn.module.scss";

const BookColumn = (props) => {
  const { COLUMNS, activeColumn, onImageLoad, activeTab, setActiveTab } = props;
  const language = useStore((s) => s.language);

  const onChangeActiveTab = (tab) => {
    setActiveTab(tab);
    setTimeout(() => {
      onImageLoad();
    }, 50);
  };

  let content = <></>;
  if (activeTab) {
    COLUMNS.forEach((column) => {
      if (column.id === activeTab.id) {
        content = (
          <div style={{ height: "100%" }}>
            <BookColumnHeader
              columnName={getTabLabel(column.label, language)}
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
        {COLUMNS.map((column) => {
          const IconComponent = getColumnIcon(column.id);
          return (
            <button key={column.id} onClick={() => onChangeActiveTab(column)}>
              <span>{getTabLabel(column.label, language)}</span>
              <IconComponent />
            </button>
          );
        })}
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
