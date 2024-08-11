import React from "react";
import BookColumn from "../../components/Book/BookColumn/BookColumn";
import BookViewer from "../../components/Book/BookViewer/BookViewer";
import BookThumnails from "../../components/Book/BookThumnails/BookThumnails";
import Modal from "../../components/Modal/Modal";
import {
  changePage,
  getColumn,
  INITIAL_PAGE,
  PAGES,
  toggleColumn,
} from "../../utils/book";
import PlayObjectModal from "../../components/Modal/PlayObjectModal/PlayObjectModal";
import styles from "./book.module.scss";

const Book = () => {
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

  const onChangePage = (state = "next") => {
    setActivePage((prevState) => changePage(pages, prevState, state));
  };

  const onClickArea = () => {
    setShowModal(true);
  };

  const toggleShowModal = () => {
    setShowModal((prevState) => !prevState);
  };

  return (
    <>
      <Modal show={showModal} handleClose={toggleShowModal}>
        <PlayObjectModal />
      </Modal>
      <div className="container">
        <div className={styles.book}>
          <BookColumn column={columns[0]} onClickMinimize={onClickMinimize}>
            <BookThumnails
              pages={pages}
              activePage={activePage}
              setActivePage={setActivePage}
            />
          </BookColumn>
          <BookViewer
            activePage={activePage}
            setActivePage={setActivePage}
            onChangePage={onChangePage}
            onClickArea={onClickArea}
          />
          <BookColumn column={columns[1]} onClickMinimize={onClickMinimize}>
            <div>Column Content</div>
          </BookColumn>
        </div>
      </div>
    </>
  );
};

export default Book;
