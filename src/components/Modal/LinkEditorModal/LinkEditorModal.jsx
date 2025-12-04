import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import styles from "./linkEditorModal.module.scss";

/**
 * LinkEditorModal Component
 * Link URL editor modal for VirtualBlock link content
 *
 * @param {Object} props
 * @param {string} props.value - Initial link URL
 * @param {Function} props.onClickSubmit - Submit handler
 * @param {Function} props.handleCloseModal - Close modal callback
 * @param {string} props.title - Modal title (optional, defaults to "Edit Link")
 */
const LinkEditorModal = (props) => {
  const {
    value: initialValue = "",
    onClickSubmit,
    handleCloseModal,
    title = "Edit Link",
  } = props;

  // Local state for link value
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState("");

  console.log("LinkEditorModal props:", {
    initialValue,
    hasSubmitHandler: !!onClickSubmit,
  });

  /**
   * Handle input changes
   */
  const onChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Clear error when user types
    if (error) {
      setError("");
    }
  };

  /**
   * Validate URL format
   */
  const isValidUrl = (urlString) => {
    try {
      // Check if it's a valid URL
      const url = new URL(urlString);
      // Only accept http and https protocols
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (err) {
      return false;
    }
  };

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    // Validate URL before submitting
    if (!value.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(value)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    if (onClickSubmit) {
      onClickSubmit(value);
    }
    // Modal will be closed by the parent
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (handleCloseModal) {
      handleCloseModal();
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles["link-editor-modal"]}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <TextField
          fullWidth
          label="Enter Link URL"
          placeholder="https://example.com"
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error || "Enter a valid HTTP or HTTPS URL"}
          variant="outlined"
          autoFocus
          type="url"
        />
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
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
      </BootstrapModal.Footer>
    </div>
  );
};

export default LinkEditorModal;
