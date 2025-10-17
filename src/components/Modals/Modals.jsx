import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useStore } from "../../store/store";
import PlayObjectModal from "../Modal/PlayObjectModal/PlayObjectModal";
import ObjectsTableModalContent from "../Modal/ObjectsTableModalContent/ObjectsTableModalContent";
import AutoUiModal from "../Modal/AutoUiModal/AutoUiModal";
import QuillModal from "../Modal/QuillModal/QuillModal";
import SubObjectModal from "../Modal/SubObjectModal/SubObjectModal";
import ObjectsTableModalContent2 from "../Modal/ObjectsTableModalContent2/ObjectsTableModalContent2";
import PlayObjectModal2 from "../Modal/PlayObjectModal2/PlayObjectModal2";

const Modals = () => {
  const { modal, closeModal } = useStore();

  const name = modal.name || "";
  const size = modal.size || "xl";
  const opened = modal.opened || false;

  let modalContent;

  switch (name) {
    case "play-object":
      modalContent = (
        <PlayObjectModal {...modal.props} handleCloseModal={closeModal} />
      );
      break;

    case "play-object-2":
      modalContent = (
        <PlayObjectModal2 {...modal.props} handleCloseModal={closeModal} />
      );
      break;

    case "tabs":
      modalContent = (
        <ObjectsTableModalContent
          {...modal.props}
          handleCloseModal={closeModal}
        />
      );
      break;

    case "quill":
      modalContent = (
        <QuillModal {...modal.props} handleCloseModal={closeModal} />
      );
      break;

    case "auto-ui":
      modalContent = (
        <AutoUiModal {...modal.props} handleCloseModal={closeModal} />
      );
      break;

    case "sub-object":
      modalContent = (
        <SubObjectModal {...modal.props} handleCloseModal={closeModal} />
      );
      break;

    case "virtual-blocks":
      modalContent = (
        <ObjectsTableModalContent2
          {...modal.props}
          handleCloseModal={closeModal}
        />
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
