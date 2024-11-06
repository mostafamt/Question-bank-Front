import React from "react";
import Modal from "../../Modal/Modal";
import SubObjectModal from "../../Modal/SubObjectModal/SubObjectModal";
import QuillModal from "../../Modal/QuillModal/QuillModal";
import AutoUiModal from "../../Modal/AutoUiModal/AutoUiModal";
import PlayObjectModal from "../../Modal/PlayObjectModal/PlayObjectModal";

const StudioModals = (props) => {
  const {
    showModal,
    handleCloseModal,
    activeImage,
    activeType,
    types,
    updateAreaProperty,
    modalName,
    workingArea,
    updateAreaPropertyById,
    typeOfActiveType,
  } = props;

  let rendererModal = <></>;
  if (modalName === "quill") {
    rendererModal = (
      <QuillModal
        workingArea={workingArea}
        updateAreaPropertyById={updateAreaPropertyById}
      />
    );
  } else if (modalName === "auto-ui") {
    rendererModal = <AutoUiModal workingArea={workingArea} />;
  } else if (modalName === "play-object") {
    rendererModal = <PlayObjectModal workingArea={workingArea} />;
  } else {
    rendererModal = (
      <SubObjectModal
        handleClose={handleCloseModal}
        image={activeImage}
        type={activeType}
        types={types}
        updateAreaProperty={updateAreaProperty}
        typeOfActiveType={typeOfActiveType}
      />
    );
  }

  return (
    <Modal show={showModal} handleClose={handleCloseModal} size="xl">
      {rendererModal}
    </Modal>
  );
};

export default StudioModals;
