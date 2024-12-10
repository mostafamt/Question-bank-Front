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
  const { children, pages: newPages, chapterId } = props;
  const [columns, setColumns] = React.useState([
    getColumn("Thumbnails"),
    getColumn("Table Of Contents"),
    getColumn("Some Tab"),
  ]);
  const [pages, setPages] = React.useState(PAGES);
  const [activePage, setActivePage] = React.useState(
    newPages?.[INITIAL_PAGE_INDEX] || ""
  );
  const [showModal, setShowModal] = React.useState(false);

  const onClickMinimize = (id) => {
    setColumns((prevState) => toggleColumn(prevState, id));
  };

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
        columns={["Thumbnails", "item 2"]}
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
      <BookColumn
        column={columns[1]}
        columns={["Table Of Contents", "item 2"]}
        onClickMinimize={onClickMinimize}
      >
        <TableOfContents
          PAGES={newPages}
          setActivePage={setActivePage}
          chapterId={chapterId}
        />
      </BookColumn>
    </div>
  );
};

export default BookContentLayout;
