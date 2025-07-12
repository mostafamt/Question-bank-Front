import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import QuillEditor from "react-quill";
import { quillModules } from "../../../utils/quill";

import styles from "./quillModal.module.scss";

const QuillModal = (props) => {
  const { workingArea, updateAreaPropertyById } = props;
  const [value, setValue] = React.useState(
    workingArea.typeOfLabel === "image"
      ? `<img src=${workingArea.image} />`
      : workingArea.text || workingArea.contentValue
  );

  console.log("QuillModal");

  const onChange = (value) => {
    setValue(value);
    updateAreaPropertyById(workingArea.id, { text: value });
  };

  return (
    <div className={styles["quill-modal"]}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <QuillEditor
          className={styles.editor}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={quillModules}
        />
      </BootstrapModal.Body>
    </div>
  );
};

export default QuillModal;
