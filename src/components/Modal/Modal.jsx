import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { useStore } from "../../store/store";
import PlayObjectModal from "./PlayObjectModal/PlayObjectModal";
import PlayObjectModal2 from "./PlayObjectModal2/PlayObjectModal2";
import ObjectsTableModalContent from "./ObjectsTableModalContent/ObjectsTableModalContent";
import ObjectsTableModalContent2 from "./ObjectsTableModalContent2/ObjectsTableModalContent2";
import AutoUiModal from "./AutoUiModal/AutoUiModal";
import QuillModal from "./QuillModal/QuillModal";
import TextEditorModal from "./TextEditorModal/TextEditorModal";
import LinkEditorModal from "./LinkEditorModal/LinkEditorModal";
import SubObjectModal from "./SubObjectModal/SubObjectModal";
import PlayCompositeBlocks from "./PlayCompositeBlocks/PlayCompositeBlocks";
import EditCompositeBlocks from "./EditCompositeBlocks/EditCompositeBlocks";
import GlossaryModal from "./GlossaryModal/GlossaryModal";
import CompositeBlocksModal from "./CompositeBlocksModal/CompositeBlocksModal";
import VirtualBlockContentModal from "./VirtualBlockContentModal/VirtualBlockContentModal";
import VirtualBlockReaderModal from "./VirtualBlockReaderModal/VirtualBlockReaderModal";
import VirtualBlockReaderNavigationModal from "./VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal";
import IframeDisplayModal from "./IframeDisplayModal/IframeDisplayModal";

// Modal registry
const MODAL_COMPONENTS = {
  "play-object": PlayObjectModal,
  "play-object-2": PlayObjectModal2,
  tabs: ObjectsTableModalContent,
  "virtual-blocks": ObjectsTableModalContent2,
  "virtual-block-content": VirtualBlockContentModal,
  "virtual-block-reader": VirtualBlockReaderModal,
  "virtual-block-reader-nav": VirtualBlockReaderNavigationModal,
  "iframe-display": IframeDisplayModal,
  "auto-ui": AutoUiModal,
  quill: QuillModal,
  "text-editor": TextEditorModal,
  "link-editor": LinkEditorModal,
  "sub-object": SubObjectModal,
  "play-composite-blocks": PlayCompositeBlocks,
  "edit-composite-blocks": EditCompositeBlocks,
  glossary: GlossaryModal,
  "composite-blocks-modal": CompositeBlocksModal,
};

const Modal = () => {
  const { modal, closeModal } = useStore();

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
