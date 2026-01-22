import React from "react";
import QuillEditor from "react-quill";
import { quillModules } from "../../../utils/quill";
import "react-quill/dist/quill.snow.css";

import styles from "./textContentDisplay.module.scss";

/**
 * TextContentDisplay Component
 * Displays text content using Quill editor with read/write capability
 * Similar to QuillModal component
 *
 * @param {Object} props
 * @param {string} props.value - HTML content to display
 * @param {string} props.title - Content title
 */
const TextContentDisplay = ({ value, title }) => {
  const [editorValue, setEditorValue] = React.useState(value || "");

  // Update editor value when prop changes (e.g., navigating to next item)
  React.useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  const onChange = (newValue) => {
    setEditorValue(newValue);
    // Note: Changes are local only, not persisted to backend in reader mode
  };

  return (
    <div className={styles["text-content-display"]}>
      <QuillEditor
        className={styles.editor}
        theme="snow"
        value={editorValue}
        onChange={onChange}
        modules={quillModules}
      />
    </div>
  );
};

export default TextContentDisplay;
