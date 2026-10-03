import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import ContentItemForm from "../VirtualBlockContentModal/ContentItemForm";

/**
 * @param {Object} props
 * @param {Function} props.onConfirm - Receives { type, contentValue }
 * @param {Function} props.handleCloseModal - Close modal callback
 * @param {string[]} [props.allowedTypes] - Content types to offer (default: all)
 * @param {Object} [props.editingContent] - Item to pre-fill when editing
 * @param {string} [props.title] - Modal title
 */
const EnrichingContentModal = (props) => {
  const {
    onConfirm,
    handleCloseModal,
    allowedTypes,
    editingContent = null,
    title = "Add Enriching Content Item",
  } = props;

  const handleSubmit = (contentItem) => {
    if (onConfirm) {
      onConfirm(contentItem);
    }
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <ContentItemForm
          allowedTypes={allowedTypes}
          editingContent={editingContent}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </BootstrapModal.Body>
    </>
  );
};

export default EnrichingContentModal;
