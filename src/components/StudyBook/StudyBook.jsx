import React from "react";
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
import { isComplexType } from "../../utils/ocr";
import QuillModal from "../Modal/QuillModal/QuillModal";

import styles from "./studyBook.module.scss";

const StudyBook = (props) => {
  const { pages, activePage, setActivePage, newPages, onChangeActivePage } =
    props;
  const [showModal, setShowModal] = React.useState(false);
  const [activeBlock, setActiveBlock] = React.useState({});

  const onChangePage = (state = "next") => {
    setActivePage((prevState) => {
      const newPage = changePage(newPages, prevState, state);
      return newPage;
    });
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
      <Modal show={showModal} handleClose={toggleShowModal} size="xl">
        {isComplexType(activeBlock.contentType) ? (
          <PlayObjectModal workingArea={activeBlock} />
        ) : (
          <QuillModal
            workingArea={activeBlock}
            updateAreaPropertyById={() => {}}
          />
        )}
      </Modal>
      <BookViewer
        activePage={activePage}
        setActivePage={setActivePage}
        onChangePage={onChangePage}
        onClickArea={onClickArea}
        newPages={newPages}
        onChangeActivePage={onChangeActivePage}
      />
    </>
  );
};

export default StudyBook;
