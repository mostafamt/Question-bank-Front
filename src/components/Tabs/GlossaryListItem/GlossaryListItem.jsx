import React from "react";
import { Box, IconButton } from "@mui/material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import EditIcon from "@mui/icons-material/Edit";

import styles from "./glossaryListItem.module.scss";

const GlossaryListItem = (props) => {
  const {
    item,
    handleClick,
    idx,
    open,
    onPlay,
    onEdit,
    onDelete,
    onMoveUp,
    onMoveDown,
    reader,
  } = props;

  const hasReferences = item?.references?.length > 0;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(item);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(item._id);
    }
  };

  const handleMoveUp = (e) => {
    e.stopPropagation();
    if (onMoveUp && hasReferences) {
      onMoveUp(item);
    }
  };

  const handleMoveDown = (e) => {
    e.stopPropagation();
    if (onMoveDown && hasReferences) {
      onMoveDown(item);
    }
  };

  return (
    <div>
      <ListItemButton onClick={() => handleClick(idx)} sx={{ p: 0 }}>
        <ListItemIcon sx={{ minWidth: 0 }}>
          {open[idx] ? <ExpandLess /> : <ExpandMore />}
        </ListItemIcon>
        <ListItemText
          primary={item.term}
          sx={{ fontWeight: "bold", "& > span": { fontWeight: "bold" } }}
        />

        {/* Action Buttons */}
        <Box className={styles["actions"]}>
          {/* <IconButton size="small" onClick={handlePlay}>
            <PlayArrowIcon fontSize="small" />
          </IconButton> */}

          {!reader && (
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}

          {reader && (
            <Box className={styles["up-down"]}>
              <IconButton
                size="small"
                onClick={handleMoveUp}
                disabled={!hasReferences}
                sx={{ opacity: hasReferences ? 1 : 0.3 }}
              >
                <NorthIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleMoveDown}
                disabled={!hasReferences}
                sx={{ opacity: hasReferences ? 1 : 0.3 }}
              >
                <SouthIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {!reader && (
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          )}
        </Box>
      </ListItemButton>
      <Collapse in={open[idx]} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Box sx={{ pl: 1, mb: 1 }}>
            <div>{item.definition}</div>
          </Box>
        </List>
      </Collapse>
    </div>
  );
};

export default GlossaryListItem;
