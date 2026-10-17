import React from "react";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { grey } from "@mui/material/colors";
import {
  DeleteForever,
  Edit,
  FormatListBulleted,
  PlayArrow,
} from "@mui/icons-material";
import { BLOCK_ACTIONS } from "../utils/blockActions";

/**
 * @file BlockContextMenu.jsx
 * @description Right-click menu for a block on the page. Shows only the
 * actions passed in; which ones apply is decided by getBlockActions.
 */

const ACTION_DISPLAY = {
  [BLOCK_ACTIONS.PLAY]: {
    label: "Play",
    icon: <PlayArrow fontSize="small" sx={{ color: grey[700] }} />,
  },
  [BLOCK_ACTIONS.EDIT]: {
    label: "Edit",
    icon: <Edit fontSize="small" sx={{ color: grey[700] }} />,
  },
  [BLOCK_ACTIONS.SHOW_IN_LIST]: {
    label: "Show in list",
    icon: <FormatListBulleted fontSize="small" sx={{ color: grey[700] }} />,
  },
  [BLOCK_ACTIONS.DELETE]: {
    label: "Delete",
    icon: <DeleteForever fontSize="small" color="error" />,
  },
};

/**
 * @param {Object} props
 * @param {{ top: number, left: number }|null} props.anchorPosition - Viewport position; null = closed
 * @param {string} [props.title] - Block name shown above the actions
 * @param {string[]} props.actions - BLOCK_ACTIONS values, in order
 * @param {Object<string, string>} [props.labels] - Per-action label overrides (e.g. reader "View")
 * @param {Function} props.onSelect - (action) => void
 * @param {Function} props.onClose
 */
const BlockContextMenu = ({
  anchorPosition,
  title,
  actions,
  labels = {},
  onSelect,
  onClose,
}) => {
  const items = [];
  actions.forEach((action) => {
    const display = ACTION_DISPLAY[action];
    if (!display) return;
    const isDelete = action === BLOCK_ACTIONS.DELETE;
    if (isDelete && items.length > 0) {
      items.push(<Divider key="delete-divider" />);
    }
    items.push(
      <MenuItem key={action} onClick={() => onSelect(action)}>
        <ListItemIcon>{display.icon}</ListItemIcon>
        <ListItemText
          primaryTypographyProps={isDelete ? { color: "error" } : undefined}
        >
          {labels[action] || display.label}
        </ListItemText>
      </MenuItem>
    );
  });

  return (
    <Menu
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || undefined}
      // Right-click outside closes this menu instead of opening the browser's on top.
      onContextMenu={(event) => {
        event.preventDefault();
        onClose();
      }}
      MenuListProps={{ dense: true, sx: { minWidth: 180 } }}
    >
      {title && (
        <ListSubheader sx={{ lineHeight: "32px" }}>{title}</ListSubheader>
      )}
      {items}
    </Menu>
  );
};

export default BlockContextMenu;
