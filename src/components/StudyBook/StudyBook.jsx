import React from "react";
import BookViewer from "../Book/BookViewer/BookViewer";
import { changePage } from "../../utils/book";
import { isObjectId } from "../../utils/objectId";
import { useStore } from "../../store/store";

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
    if (isObjectId(block.contentValue)) {
      openModal("play-object", {
        workingArea: block,
      });
    } else if (block.contentType === "Video") {
      openModal("video-player", {
        url: block.contentValue,
      });
    } else if (block.contentType === "Voice") {
      openModal("audio-player", {
        url: block.contentValue,
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
