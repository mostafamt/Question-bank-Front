import React from "react";
import BookColumn from "../../components/Book/BookColumn/BookColumn";
import BookThumnails from "../../components/Book/BookThumnails/BookThumnails";
import {
  changePage,
  getColumn,
  INITIAL_PAGE,
  PAGES,
  toggleColumn,
} from "../../utils/book";

import styles from "./bookContentLayout.module.scss";

const BookContentLayout = (props) => {
  const { children } = props;
  const [columns, setColumns] = React.useState([
    getColumn("Thumbnails"),
    getColumn("Action"),
  ]);
  const [pages, setPages] = React.useState(PAGES);
  const [activePage, setActivePage] = React.useState(INITIAL_PAGE);
  const [showModal, setShowModal] = React.useState(false);

  const onClickMinimize = (id) => {
    setColumns((prevState) => toggleColumn(prevState, id));
  };

  const clonedElement = React.cloneElement(children, {
    pages,
    activePage,
    setActivePage,
  });

  return (
    <div className={styles["book-content-layout"]}>
      <BookColumn
        column={columns[0]}
        onClickMinimize={onClickMinimize}
        classNameOpened={styles.try}
      >
        <BookThumnails
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </BookColumn>
      <div>{clonedElement}</div>
      <BookColumn column={columns[1]} onClickMinimize={onClickMinimize}>
        <div>Column Content</div>
      </BookColumn>
    </div>
  );
};

export default BookContentLayout;
