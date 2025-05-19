import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import QuillEditor from "react-quill";

import styles from "./quillModal.module.scss";

const QuillModal = (props) => {
  const { workingArea, updateAreaPropertyById } = props;
  const [value, setValue] = React.useState(
    workingArea.text || workingArea.contentValue
  );

  console.log("QuillModal");

  const onChange = (value) => {
    setValue(value);
    updateAreaPropertyById(workingArea.id, { text: value });
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
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
          modules={modules}
        />
      </BootstrapModal.Body>
    </div>
  );
};

export default QuillModal;
