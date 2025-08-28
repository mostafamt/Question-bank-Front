import React from "react";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import styles from "./bookColumn.module.scss";

const BookColumn2 = (props) => {
  const [open, setOpen] = React.useState(false);
  const [columns, setColumns] = React.useState(props.columns);
  const [activeColumn, setActiveColumn] = React.useState(props.columns[0]);
  const { activePage, setActivePage } = props;
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    setColumns(props.columns);
  }, [props.columns]);

  return (
    <div
      className={styles["book-column"]}
      style={
        activeColumn
          ? { flex: `0 0 ${20}%` }
          : { flex: `0 0 2.6%`, overflow: "hidden" }
      }
      ref={containerRef}
    >
      {activeColumn ? (
        <div
          className={styles.opened}
          style={{
            flex: `0 0 ${20}%`,
          }}
        >
          <div className={styles.head}>
            <span>{activeColumn.label}</span>
            <button onClick={() => setActiveColumn(null)}>
              <MinimizeIcon />
            </button>
          </div>
          <div>
            {React.cloneElement(activeColumn.component, {
              ...activeColumn.props,
              activePage,
              ...(activeColumn.label === "Thumbnails" && { ref: containerRef }),
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
