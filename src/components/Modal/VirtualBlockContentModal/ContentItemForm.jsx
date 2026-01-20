import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
} from "@mui/material";
import QuillEditor from "react-quill";
import { quillModules } from "../../../utils/quill";
import RadioQuestionsTable from "../../Tables/RadioQuestionsTable/RadioQuestionsTable";

import styles from "./virtualBlockContentModal.module.scss";

/**
 * ContentItemForm Component
 * Form for adding/editing a single content item
 *
 * @param {Object} props
 * @param {string} props.selectedLabel - The block label
 * @param {string} props.iconLocation - The icon position
 * @param {Object} props.editingContent - Content being edited (null for new)
 * @param {Function} props.onSubmit - Submit handler, receives contentItem
 * @param {Function} props.onCancel - Cancel handler
 */
const ContentItemForm = (props) => {
  const {
    selectedLabel,
    iconLocation,
    editingContent = null,
    onSubmit,
    onCancel,
  } = props;

  // Initialize state based on editing content or defaults
  const [contentType, setContentType] = React.useState(
    editingContent?.type || "text"
  );
  const [textValue, setTextValue] = React.useState(
    editingContent?.type === "text" ? editingContent.contentValue : ""
  );
  const [linkValue, setLinkValue] = React.useState(
    editingContent?.type === "link" ? editingContent.contentValue : ""
  );
  const [objectValue, setObjectValue] = React.useState(
    editingContent?.type === "object" ? editingContent.contentValue : ""
  );
  const [error, setError] = React.useState("");

  console.log("ContentItemForm initialized with:", {
    editingContent,
    contentType,
  });

  /**
   * Handle content type change
   */
  const handleContentTypeChange = (event, newType) => {
    if (newType !== null) {
      setContentType(newType);
      setError("");
    }
  };

  /**
   * Validate URL format
   */
  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (err) {
      return false;
    }
  };

  /**
   * Validate form based on content type
   */
  const validateForm = () => {
    switch (contentType) {
      case "text":
        if (!textValue || textValue.trim() === "" || textValue === "<p><br></p>") {
          setError("Please enter some text content");
          return false;
        }
        break;

      case "link":
        if (!linkValue.trim()) {
          setError("Please enter a URL");
          return false;
        }
        if (!isValidUrl(linkValue)) {
          setError("Please enter a valid URL (e.g., https://example.com)");
          return false;
        }
        break;

      case "object":
        if (!objectValue) {
          setError("Please select an object");
          return false;
        }
        break;

      default:
        setError("Invalid content type");
        return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Get content value based on type
    let contentValue;
    switch (contentType) {
      case "text":
        contentValue = textValue;
        break;
      case "link":
        contentValue = linkValue;
        break;
      case "object":
        contentValue = objectValue;
        break;
      default:
        contentValue = "";
    }

    const contentItem = {
      type: contentType,
      contentValue: contentValue,
    };

    console.log("Submitting content item:", contentItem);

    if (onSubmit) {
      onSubmit(contentItem);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={styles["content-form"]}>
      {/* Content Type Selector */}
      <Box mb={2}>
        <Typography variant="body2" gutterBottom>
          Content Type
        </Typography>
        <ToggleButtonGroup
          value={contentType}
          exclusive
          onChange={handleContentTypeChange}
          aria-label="content type"
          fullWidth
          size="small"
        >
          <ToggleButton value="text" aria-label="text content">
            📄 Text
          </ToggleButton>
          <ToggleButton value="link" aria-label="link content">
            🔗 Link
          </ToggleButton>
          <ToggleButton value="object" aria-label="object content">
            🎮 Object
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content Input Based on Type */}
      <Box mb={2}>
        {contentType === "text" && (
          <div className={styles["text-editor"]}>
            <Typography variant="body2" gutterBottom>
              Text Content
            </Typography>
            <QuillEditor
              className={styles.editor}
              theme="snow"
              value={textValue}
              onChange={setTextValue}
              modules={quillModules}
              placeholder="Enter your text content here..."
            />
          </div>
        )}

        {contentType === "link" && (
          <TextField
            fullWidth
            label="Enter Link URL"
            placeholder="https://example.com"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            variant="outlined"
            type="url"
            helperText="Enter a valid HTTP or HTTPS URL"
          />
        )}

        {contentType === "object" && (
          <div className={styles["object-selector"]}>
            <Typography variant="body2" gutterBottom>
              Select Interactive Object
            </Typography>
            <RadioQuestionsTable
              object={objectValue}
              setObject={setObjectValue}
            />
          </div>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Box mb={2}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {editingContent ? "Update" : "Add to List"}
        </Button>
      </Box>
    </div>
  );
};

export default ContentItemForm;
