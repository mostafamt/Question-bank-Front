import React from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import StraightIcon from "@mui/icons-material/Straight";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
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
      <span className={styles["up-down"]}>
        <IconButton onClick={() => {}}>
          <NorthIcon />
        </IconButton>
        <IconButton onClick={() => {}}>
          <SouthIcon />
        </IconButton>
      </span>
      {reader ? (
        <></>
      ) : (
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
