import React from "react";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import styles from "./bookColumn.module.scss";

const BookColumn2 = (props) => {
  const [columns, setColumns] = React.useState(props.columns);
  const [activeColumn, setActiveColumn] = React.useState(props.columns[0]);
  const { activePage, setActivePage } = props;

  React.useEffect(() => {
    setColumns(props.columns);
  }, [props.columns]);

  React.useEffect(() => {
    console.log("window.innerWidth= ", window.innerWidth);
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        console.log("here");
        setActiveColumn(null);
      }
    };

    checkMobile(); // run on mount
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className={styles["book-column"]}
      style={
        activeColumn
          ? { flex: `0 0 ${20}%` }
          : {
              flex: `0 0 ${window.innerWidth <= 768 ? 6.6 : 2.6}%`,
              overflow: "hidden",
            }
      }
    >
      {activeColumn ? (
        <div className={styles.opened}>
          <div className={styles.head}>
            <span>{activeColumn.label}</span>
            <button onClick={() => setActiveColumn(null)}>
              <MinimizeIcon />
            </button>
          </div>
          <div className={styles.body}>
            {React.cloneElement(activeColumn.component, {
              ...activeColumn.props,
              activePage,
            })}
          </div>
        </div>
      ) : (
        <div className={styles.closed}>
          {columns.map((column) => (
            <button key={column.id} onClick={() => setActiveColumn(column)}>
              <span>{column.label}</span>
              <ContentCopyIcon />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookColumn2;
