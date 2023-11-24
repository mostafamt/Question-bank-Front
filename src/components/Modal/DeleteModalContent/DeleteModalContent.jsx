import React from "react";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";

import styles from "./deleteModalContent.module.scss";

const DeleteModalContent = (props) => {
  const { handleClose, onDelete } = props;
  return (
    <div className={styles["modal-content"]}>
      <div className={styles["delete-icon"]}>
        <DeleteIcon color="error" fontSize="large" />
      </div>
      <h4>Delete Question</h4>
      <p>Are you sure to delete this question?</p>

      <div>
        <Button variant="outlined" onClick={handleClose}>
          <ClearIcon />
          <span>cancel</span>
        </Button>
        <Button variant="contained" color="error" onClick={onDelete}>
          <DeleteIcon />
          <span>delete question</span>
        </Button>
      </div>
    </div>
  );
};

export default DeleteModalContent;
