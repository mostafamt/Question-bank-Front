import React from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import MultipleChoiceForm from "../../../pages/MultipleChoiceForm/MultipleChoiceForm";
import { toast } from "react-toastify";

import styles from "./editParametersModal.module.scss";

const EditParametersModal = (props) => {
  const { handleClose } = props;

  const handleSubmit = () => {
    handleClose();
    toast.success("Question created successfully!");
  };

  return (
    <div className={styles["modal-content"]}>
      <div className={styles.close}>
        <Tooltip title="Close">
          <IconButton aria-label="Close" onClick={handleClose}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </div>

      <MultipleChoiceForm onSubmit={handleSubmit} />
    </div>
  );
};

export default EditParametersModal;
