import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import ContentItemForm from "../VirtualBlockContentModal/ContentItemForm";

const SnapLearningModal = (props) => {
  const { onConfirm, handleCloseModal } = props;

  const handleSubmit = (contentItem) => {
    if (onConfirm) {
      onConfirm(contentItem);
    }
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Add Snap Learning Item</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <ContentItemForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </BootstrapModal.Body>
    </>
  );
};

export default SnapLearningModal;
