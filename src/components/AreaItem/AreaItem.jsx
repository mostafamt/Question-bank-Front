import React from "react";
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { hexToRgbA } from "../../utils/helper";

import styles from "./areaItem.module.scss";

const AreaItem = ({
  id,
  title,
  color,
  isOpen,
  handleToggle,
  area,
  actions = [],
  children,
}) => {
  return (
    <div
      className={styles["area-item"]}
      style={{
        borderColor: hexToRgbA(color),
      }}
    >
      <ListItemButton
        onClick={() => handleToggle()}
        sx={{
          background: hexToRgbA(color),
        }}
      >
        <div className={styles.header}>
          <ListItemText primary={title} />
          {isOpen ? <RemoveIcon /> : <AddIcon />}
        </div>
        <div style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}>
          {area?.name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // padding: "1rem",
            width: "100%",
          }}
        >
          {actions.map((action, index) => (
            <IconButton
              key={index}
              aria-label={action.label}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick?.(id, e);
              }}
            >
              {action.icon}
            </IconButton>
          ))}
        </div>
      </ListItemButton>

      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <Box sx={{ borderRadius: "3px", p: "1rem 0.5rem" }}>{children}</Box>
        </List>
      </Collapse>
    </div>
  );
};

AreaItem.defaultProps = {
  color: "#000000",
  isOpen: false,
  actions: [],
  children: null,
  handleToggle: () => {},
};

export default AreaItem;
