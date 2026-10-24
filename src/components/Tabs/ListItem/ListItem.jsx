import React from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Tooltip } from "@mui/material";
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
    }
  };

  const onClickDown = (e) => {
    e.stopPropagation();
    if (onMoveDown) {
      onMoveDown();
    } else {
    }
  };

  return (
    <li className={styles["list-item"]}>
      <span>{item.name}</span>
      <span>
        <Tooltip title="Play">
          <IconButton aria-label="Play" onClick={() => onPlay(item)}>
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
      </span>
      {reader && (
        <span className={styles["up-down"]}>
          <Tooltip title="Go to item in page">
            <span>
              <IconButton
                aria-label="Go to item in page"
                onClick={onClickUp}
                disabled={!hasReferences}
                sx={{ opacity: hasReferences ? 1 : 0.3 }}
              >
                <KeyboardArrowUpIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Go to item in page">
            <span>
              <IconButton
                aria-label="Go to item in page"
                onClick={onClickDown}
                disabled={!hasReferences}
                sx={{ opacity: hasReferences ? 1 : 0.3 }}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </span>
          </Tooltip>
        </span>
      )}
      {reader ? (
        <></>
      ) : (
        <span>
          <Tooltip title="Delete">
            <IconButton aria-label="Delete" onClick={() => onDelete(item._id)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </span>
      )}
    </li>
  );
};

export default ListItem;
