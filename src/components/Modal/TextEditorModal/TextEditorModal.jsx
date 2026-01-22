import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Button from "@mui/material/Button";
import QuillEditor from "react-quill";
import "react-quill/dist/quill.snow.css";
import { quillModules } from "../../../utils/quill";

import styles from "./textEditorModal.module.scss";

/**
 * TextEditorModal Component
 * Rich text editor modal for VirtualBlock Notes and Summary
 *
 * @param {Object} props
 * @param {string} props.value - Initial text content
 * @param {Function} props.setValue - State setter (optional)
 * @param {Function} props.onClickSubmit - Submit handler
 * @param {Function} props.handleCloseModal - Close modal callback
 * @param {string} props.title - Modal title (optional, defaults to "Edit Content")
 */
const TextEditorModal = (props) => {
  const {
    value: initialValue = "",
    setValue: propSetValue,
    onClickSubmit,
    handleCloseModal,
    title = "Edit Content",
  } = props;

  // Local state for editor value
  const [value, setValue] = React.useState(initialValue);

  console.log("TextEditorModal props:", {
    initialValue,
    hasSubmitHandler: !!onClickSubmit,
  });

  // Determine if modal is in read-only mode
  const isReadOnly = !onClickSubmit;

  /**
   * Handle content changes
   */
  const onChange = (newValue) => {
    setValue(newValue);

    // Update external state if provided
    if (propSetValue) {
      propSetValue(newValue);
    }
  };

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    if (onClickSubmit) {
      onClickSubmit(value);
    }
    // Modal will be closed by the parent
  };

  /**
   * Handle cancel/close
   */
  const handleCancel = () => {
    if (handleCloseModal) {
      handleCloseModal();
    }
  };

  return (
    <div className={styles["text-editor-modal"]}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <QuillEditor
          className={styles.editor}
          theme="snow"
          value={value}
          onChange={onChange}
          readOnly={isReadOnly}
          modules={isReadOnly ? { toolbar: false } : quillModules}
        />
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        {isReadOnly ? (
          // Read-only mode: Only show Close button
          <Button
            variant="contained"
            color="primary"
            onClick={handleCancel}
          >
            Close
          </Button>
        ) : (
          // Edit mode: Show Cancel and Save buttons
          <>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </>
        )}
      </BootstrapModal.Footer>
    </div>
  );
};

export default TextEditorModal;
