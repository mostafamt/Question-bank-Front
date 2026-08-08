import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import QuillEditor from "react-quill";
import { quillModules, quillFormats } from "../../../utils/quill";

import styles from "./quillModal.module.scss";

/**
 * QuillModal Component
 * Rich text editor modal for editing text content in areas
 * Now supports extended font options (Phase 1: System fonts)
 */
const QuillModal = (props) => {
  const { workingArea, updateAreaPropertyById } = props;
  const [value, setValue] = React.useState(
    workingArea?.typeOfLabel === "image"
      ? `<img src=${workingArea.image} />`
      : workingArea?.contentType === "Picture"
      ? `<img src=${workingArea.contentValue} />`
      : workingArea?.text || workingArea.contentValue
  );

  const onChange = (value) => {
    setValue(value);
    updateAreaPropertyById(workingArea.id, { text: value });
  };

  return (
    <div className={styles["quill-modal"]}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Edit Text</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <QuillEditor
          className={styles.editor}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={quillModules}
          formats={quillFormats}
        />
      </BootstrapModal.Body>
    </div>
  );
};

export default QuillModal;
