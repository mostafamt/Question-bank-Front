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
import { useStore } from "../../store/store";

import styles from "./studyBook.module.scss";

const StudyBook = (props) => {
  const {
    pages,
    activePage,
    setActivePage,
    newPages,
    onChangeActivePage,
    highlightedBlockId,
  } = props;
  const [activeBlock, setActiveBlock] = React.useState({});
  const { openModal } = useStore();

  const onChangePage = (state = "next") => {
    setActivePage((prevState) => {
      const newPage = changePage(newPages, prevState, state);
      return newPage;
    });
  };

  const onClickArea = (block) => {
    setActiveBlock(block);
    let isComplex = isComplexType(activeBlock.contentType);
    console.log("isComplex= ", isComplex);
    if (isComplex) {
      openModal("play-object", {
        workingArea: block,
      });
    } else {
      openModal("quill", {
        workingArea: block,
        updateAreaPropertyById: () => {},
      });
    }
  };

  return (
    <>
      <BookViewer
        activePage={activePage}
        setActivePage={setActivePage}
        onChangePage={onChangePage}
        onClickArea={onClickArea}
        newPages={pages}
        onChangeActivePage={onChangeActivePage}
        highlightedBlockId={highlightedBlockId}
      />
    </>
  );
};

export default StudyBook;
