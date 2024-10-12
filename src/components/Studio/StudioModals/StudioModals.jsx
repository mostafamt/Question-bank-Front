import React from "react";
import Modal from "../../Modal/Modal";
import SubObjectModal from "../../Modal/SubObjectModal/SubObjectModal";
import QuillModal from "../../Modal/QuillModal/QuillModal";
import AutoUiModal from "../../Modal/AutoUiModal/AutoUiModal";

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
  } else {
    rendererModal = (
      <SubObjectModal
        handleClose={handleCloseModal}
        image={activeImage}
        type={activeType}
        types={types}
        updateAreaProperty={updateAreaProperty}
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
