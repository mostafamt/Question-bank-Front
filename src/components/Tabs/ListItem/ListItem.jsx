import React from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import { IconButton } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import styles from "./listItem.module.scss";

const ListItem = ({ item, onPlay, onDelete, onMoveUp, onMoveDown, reader }) => {
  const hasReferences = item?.references?.length > 0;

  const onClickUp = (e) => {
    e.stopPropagation();
    if (onMoveUp) {
      onMoveUp();
    } else {
      console.log("onClickUp - no handler provided");
    }
  };

  const onClickDown = (e) => {
    e.stopPropagation();
    if (onMoveDown) {
      onMoveDown();
    } else {
      console.log("onClickDown - no handler provided");
    }
  };

  return (
    <li className={styles["list-item"]}>
      <span>{item.name}</span>
      <span>
        <IconButton onClick={() => onPlay(item)}>
          <PlayArrowIcon />
        </IconButton>
      </span>
      {reader && (
        <span className={styles["up-down"]}>
          <IconButton
            onClick={onClickUp}
            disabled={!hasReferences}
            sx={{ opacity: hasReferences ? 1 : 0.3 }}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
          <IconButton
            onClick={onClickDown}
            disabled={!hasReferences}
            sx={{ opacity: hasReferences ? 1 : 0.3 }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </span>
      )}
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
