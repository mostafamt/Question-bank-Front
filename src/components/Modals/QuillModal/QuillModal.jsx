import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { quillModules } from "../../../utils/quill";
import QuillEditor from "react-quill";
import { Button } from "@mui/material";
import { useStore } from "../../../store/store";

import styles from "./quillModal.module.scss";

const QuillModal = (props) => {
  const { onClickSubmit } = props;

  const { data: state, setFormState } = useStore();

  const [value, setValue] = React.useState(props.value || "");

  const onSubmit = () => {
    setFormState({
      ...state,
      modal: {
        ...state.modal,
        opened: false,
      },
    });

    onClickSubmit(value);
  };

  return (
    <div className={styles["quill-modal"]}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Text</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body style={{ height: "400px" }}>
        <QuillEditor
          theme="snow"
          modules={quillModules}
          className={styles.editor}
          value={value}
          onChange={setValue}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <div>
          <Button variant="contained" onClick={onSubmit}>
            submit
          </Button>
        </div>
      </BootstrapModal.Footer>
    </div>
  );
};

export default QuillModal;
