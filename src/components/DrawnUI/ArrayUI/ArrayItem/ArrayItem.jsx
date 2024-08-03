import React from "react";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./arrayItem.module.scss";
import { fullTextTrim } from "../../../../utils/data";

const ArrayItem = (props) => {
  const {
    open,
    onClickItem,
    remove,
    type,
    index,
    parseParameters,
    space,
    level,
    label,
  } = props;

  const RemoveButton = () => {
    return (
      <div className={styles["remove-box"]}>
        <IconButton aria-label="delete" onClick={remove} color="error">
          <DeleteIcon />
        </IconButton>
      </div>
    );
  };

  return (
    <div className={styles["array-item"]}>
      <ListItemButton onClick={onClickItem}>
        <ListItemText primary={`${fullTextTrim(label)} ${index + 1}`} />
        <RemoveButton />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Box>
            <div className={styles.array}>
              {type.map((itm, innerIndex) => (
                <div key={innerIndex} className={styles.item}>
                  {parseParameters(itm, space - 2, level + 1, index, label)}
                </div>
              ))}
            </div>
          </Box>
        </List>
      </Collapse>
    </div>
  );
};

export default ArrayItem;
