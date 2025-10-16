import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useStore } from "../../store/store";
import PlayObjectModal from "./PlayObjectModal/PlayObjectModal";
import PlayObjectModal2 from "./PlayObjectModal2/PlayObjectModal2";
import ObjectsTableModalContent from "./ObjectsTableModalContent/ObjectsTableModalContent";
import ObjectsTableModalContent2 from "./ObjectsTableModalContent2/ObjectsTableModalContent2";
import AutoUiModal from "./AutoUiModal/AutoUiModal";
import QuillModal from "./QuillModal/QuillModal";
import SubObjectModal from "./SubObjectModal/SubObjectModal";

// Modal registry
const MODAL_COMPONENTS = {
  "play-object": PlayObjectModal,
  "play-object-2": PlayObjectModal2,
  tabs: ObjectsTableModalContent,
  "virtual-blocks": ObjectsTableModalContent2,
  "auto-ui": AutoUiModal,
  quill: QuillModal,
  "sub-object": SubObjectModal,
};

const Modal = () => {
  const { modal, closeModal } = useStore();

  console.log("modal= ", modal);

  const { name = "", size = "xl", opened = false, props = {} } = modal;

  // Get modal component by name
  const ModalComponent = MODAL_COMPONENTS[name] || null;

  return (
    <BootstrapModal show={opened} onHide={closeModal} size={size}>
      {ModalComponent && (
        <ModalComponent {...props} handleCloseModal={closeModal} />
      )}
    </BootstrapModal>
  );
};

export default Modal;
