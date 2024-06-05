import React from "react";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";

import styles from "./deleteModalContent.module.scss";

const DeleteModalContent = (props) => {
  const { handleClose, onDelete, name } = props;

  const deletedName = name || "name";

  return (
    <div className={styles["modal-content"]}>
      <div className={styles["delete-icon"]}>
        <DeleteIcon color="error" fontSize="large" />
      </div>
      <h4>Delete {deletedName}</h4>
      <p>Are you sure to delete this {deletedName}?</p>

      <div>
        <Button variant="outlined" onClick={handleClose}>
          <ClearIcon />
          <span>cancel</span>
        </Button>
        <Button variant="contained" color="error" onClick={onDelete}>
          <DeleteIcon />
          <span>delete {deletedName}</span>
        </Button>
      </div>
    </div>
  );
};

export default DeleteModalContent;
