import React from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";

import styles from "./listItem.module.scss";

const ListItem = ({ item, onPlay, onDelete, reader }) => {
  return (
    <li className={styles["list-item"]}>
      <span>{item.name}</span>
      <span>
        <IconButton onClick={() => onPlay(item)}>
          <PlayArrowIcon />
        </IconButton>
      </span>
      {!reader && (
        <span>
          <IconButton onClick={() => onDelete(item._id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </span>
      )}
    </li>
  );
};

export default ListItem;
