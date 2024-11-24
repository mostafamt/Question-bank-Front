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
  const { pages, activePage, setActivePage, newPages } = props;
  // const [pages, setPages] = React.useState(PAGES);
  // const [activePage, setActivePage] = React.useState(INITIAL_PAGE);
  const [showModal, setShowModal] = React.useState(false);
  const [activeBlock, setActiveBlock] = React.useState({});

  const onChangePage = (state = "next") => {
    setActivePage((prevState) => changePage(newPages, prevState, state));
  };

  const onClickArea = (block) => {
    setShowModal(true);
    setActiveBlock(block);
  };

  const toggleShowModal = () => {
    setShowModal((prevState) => !prevState);
  };

  return (
    <>
      <Modal show={showModal} handleClose={toggleShowModal}>
        <PlayObjectModal workingArea={activeBlock} />
      </Modal>
      <BookViewer
        activePage={activePage}
        setActivePage={setActivePage}
        onChangePage={onChangePage}
        onClickArea={onClickArea}
        newPages={newPages}
      />
    </>
  );
};

export default StudyBook;
