import React from "react";
import BookColumn from "../../components/Book/BookColumn/BookColumn";
import BookThumnails from "../../components/Book/BookThumnails/BookThumnails";
import {
  changePage,
  getColumn,
  INITIAL_PAGE,
  INITIAL_PAGE_INDEX,
  PAGES,
  toggleColumn,
} from "../../utils/book";

import styles from "./bookContentLayout.module.scss";
import TableOfContents from "../../components/Book/TableOfContents/TableOfContents";

const BookContentLayout = (props) => {
  const { children, pages: newPages } = props;
  const [columns, setColumns] = React.useState([
    getColumn("Thumbnails"),
    getColumn("Table Of Contents"),
  ]);
  const [pages, setPages] = React.useState(PAGES);
  const [activePage, setActivePage] = React.useState(
    newPages?.[INITIAL_PAGE_INDEX] || ""
  );
  const [showModal, setShowModal] = React.useState(false);

  const onClickMinimize = (id) => {
    setColumns((prevState) => toggleColumn(prevState, id));
  };

  console.log("activePage= ", newPages?.[INITIAL_PAGE_INDEX]);
  console.log("activePage= ", activePage);

  React.useEffect(() => {
    setActivePage(newPages?.[INITIAL_PAGE_INDEX]);
  }, [newPages]);

  const clonedElement = React.cloneElement(children, {
    pages,
    activePage,
    setActivePage,
    newPages,
  });

  return (
    <div className={styles["book-content-layout"]}>
      <BookColumn
        column={columns[0]}
        onClickMinimize={onClickMinimize}
        classNameOpened={styles.try}
      >
        <BookThumnails
          pages={newPages}
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </BookColumn>
      <div>{clonedElement}</div>
      <BookColumn column={columns[1]} onClickMinimize={onClickMinimize}>
        <TableOfContents setActivePage={setActivePage} />
      </BookColumn>
    </div>
  );
};

export default BookContentLayout;
