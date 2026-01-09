import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Button from "@mui/material/Button";
import ContentItemList from "./ContentItemList";
import ContentItemForm from "./ContentItemForm";

import styles from "./virtualBlockContentModal.module.scss";

/**
 * VirtualBlockContentModal Component
 * Modal for managing multiple content items for a virtual block
 *
 * @param {Object} props
 * @param {string} props.selectedLabel - The chosen block label (e.g., "Notes 📝", "Recall")
 * @param {string} props.iconLocation - The icon position (TL, TM, TR, L1-R6, BL, BM, BR)
 * @param {Array} props.existingContents - Array of existing content items
 * @param {Function} props.onSave - Save handler, receives array of contents
 * @param {Function} props.handleCloseModal - Close modal callback
 */
const VirtualBlockContentModal = (props) => {
  const {
    selectedLabel = "",
    iconLocation = "",
    existingContents = [],
    onSave,
    handleCloseModal,
  } = props;

  console.log("VirtualBlockContentModal opened with:", {
    selectedLabel,
    iconLocation,
    existingContents,
  });

  // Local state for managing content items
  const [contents, setContents] = React.useState(existingContents);
  const [showForm, setShowForm] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState(null);

  /**
   * Handle adding new content item
   */
  const handleAddContent = (contentItem) => {
    const newContentItem = {
      type: contentItem.type,
      iconLocation: iconLocation,
      contentType: selectedLabel,
      contentValue: contentItem.contentValue,
    };

    if (editingIndex !== null) {
      // Update existing item
      const updatedContents = [...contents];
      updatedContents[editingIndex] = newContentItem;
      setContents(updatedContents);
      setEditingIndex(null);
    } else {
      // Add new item
      setContents([...contents, newContentItem]);
    }

    // Hide form after adding
    setShowForm(false);
  };

  /**
   * Handle editing content item
   */
  const handleEditContent = (index) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  /**
   * Handle deleting content item
   */
  const handleDeleteContent = (index) => {
    const updatedContents = contents.filter((_, i) => i !== index);
    setContents(updatedContents);
  };

  /**
   * Handle cancel form
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  /**
   * Handle save all contents
   */
  const handleSaveAll = () => {
    if (onSave) {
      onSave(contents);
    }
    // Modal will be closed by parent
  };

  /**
   * Handle cancel modal
   */
  const handleCancel = () => {
    if (handleCloseModal) {
      handleCloseModal();
    }
  };

  // Get content being edited
  const editingContent = editingIndex !== null ? contents[editingIndex] : null;

  return (
    <div
      className={styles["virtual-block-content-modal"]}
      role="dialog"
      aria-labelledby="virtual-block-modal-title"
      aria-describedby="virtual-block-modal-description"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="virtual-block-modal-title">
          Virtual Block: {selectedLabel}
        </BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <div
          className={styles.container}
          id="virtual-block-modal-description"
        >
          {/* Existing Content Items List */}
          {contents.length > 0 && (
            <div className={styles.section} role="region" aria-label="Existing content items">
              <h6 className={styles.sectionTitle}>
                Content Items ({contents.length})
              </h6>
              <ContentItemList
                contents={contents}
                onEdit={handleEditContent}
                onDelete={handleDeleteContent}
              />
            </div>
          )}

          {/* Add New Content Button */}
          {!showForm && (
            <div className={styles.section}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowForm(true)}
                fullWidth
                aria-label="Add new content item"
              >
                + Add New Content
              </Button>
            </div>
          )}

          {/* Content Item Form */}
          {showForm && (
            <div
              className={styles.section}
              role="region"
              aria-label={editingIndex !== null ? "Edit content form" : "Add content form"}
            >
              <h6 className={styles.sectionTitle}>
                {editingIndex !== null ? "Edit Content" : "Add Content"}
              </h6>
              <ContentItemForm
                selectedLabel={selectedLabel}
                iconLocation={iconLocation}
                editingContent={editingContent}
                onSubmit={handleAddContent}
                onCancel={handleCancelForm}
              />
            </div>
          )}
        </div>
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          aria-label="Cancel and close modal"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveAll}
          aria-label={`Save all ${contents.length} content items`}
        >
          Save All
        </Button>
      </BootstrapModal.Footer>
    </div>
  );
};

export default VirtualBlockContentModal;
