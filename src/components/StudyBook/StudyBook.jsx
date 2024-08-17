import React from "react";
import BookColumn from "../Book/BookColumn/BookColumn";
import BookViewer from "../Book/BookViewer/BookViewer";
import BookThumnails from "../Book/BookThumnails/BookThumnails";
import Modal from "../Modal/Modal";
import {
  changePage,
  getColumn,
  INITIAL_PAGE,
  PAGES,
  toggleColumn,
} from "../../utils/book";
import PlayObjectModal from "../Modal/PlayObjectModal/PlayObjectModal";
import styles from "./studyBook.module.scss";

const StudyBook = (props) => {
  //   const { pages, activePage, setActivePage } = props;
  const [pages, setPages] = React.useState(PAGES);
  const [activePage, setActivePage] = React.useState(INITIAL_PAGE);
  const [showModal, setShowModal] = React.useState(false);

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
      <BookViewer
        activePage={activePage}
        setActivePage={setActivePage}
        onChangePage={onChangePage}
        onClickArea={onClickArea}
      />
    </>
  );
};

export default StudyBook;
