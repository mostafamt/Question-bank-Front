import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useStore } from "../../store/store";
import PlayObjectModal from "../Modal/PlayObjectModal/PlayObjectModal";
import ObjectsTableModalContent from "../Modal/ObjectsTableModalContent/ObjectsTableModalContent";
import AutoUiModal from "../Modal/AutoUiModal/AutoUiModal";
import QuillModal from "../Modal/QuillModal/QuillModal";

const Modals = () => {
  const { data: state, setFormState } = useStore();

  const name = state.modal.name || "";
  const size = state.modal.size || "xl";
  const opened = state.modal.opened || false;

  const closeModal = () => {
    setFormState({
      ...state,
      modal: {
        ...state.modal,
        opened: false,
      },
    });
  };

  let modalContent;

  switch (name) {
    case "play-object":
      modalContent = (
        <PlayObjectModal {...state.modal.props} handleCloseModal={closeModal} />
      );
      break;

    case "tabs":
      modalContent = (
        <ObjectsTableModalContent
          {...state.modal.props}
          handleCloseModal={closeModal}
        />
      );
      break;

    case "quill":
      modalContent = (
        <QuillModal {...state.modal.props} handleCloseModal={closeModal} />
      );
      break;

    case "auto-ui":
      modalContent = (
        <AutoUiModal {...state.modal.props} handleCloseModal={closeModal} />
      );
      break;

    default:
      modalContent = null;
      break;
  }

  return (
    <BootstrapModal show={opened} onHide={closeModal} size={size}>
      {modalContent}
    </BootstrapModal>
  );
};

export default Modals;
