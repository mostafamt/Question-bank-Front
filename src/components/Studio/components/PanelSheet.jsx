/**
 * @file PanelSheet.jsx
 * @description Below-desktop container for a Studio side panel: a side drawer
 * on tablets, a bottom sheet on phones.
 *
 * Minimize only hides the sheet — the panel's tab stays active, because the
 * active right tab drives the editor mode (e.g. Block Authoring enables
 * drawing) and the author needs the page uncovered to draw. Close clears the
 * tab, like the desktop column's minimize button.
 */

import React from "react";
import { Box, Drawer, IconButton, Tooltip, Typography } from "@mui/material";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CloseIcon from "@mui/icons-material/Close";

import styles from "./panelSheet.module.scss";

const SHEET_SIDE_SX = {
  width: "min(360px, 85vw)",
  display: "flex",
  flexDirection: "column",
};

const SHEET_BOTTOM_SX = {
  height: "85vh",
  "@supports (height: 100dvh)": { height: "85dvh" },
  display: "flex",
  flexDirection: "column",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
};

/**
 * @param {Object} props
 * @param {boolean} props.open - Whether the sheet is shown
 * @param {"left"|"right"|"bottom"} props.anchor - Edge the sheet slides from
 *   (MUI flips left/right in RTL, matching the rail's side)
 * @param {string} props.title - Panel name
 * @param {Function} props.onMinimize - Hide the sheet, keep the tab active
 * @param {Function} props.onClose - Hide the sheet and clear the tab
 * @param {React.ReactNode} props.children - Panel content
 */
const PanelSheet = ({ open, anchor, title, onMinimize, onClose, children }) => {
  const isBottom = anchor === "bottom";

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onMinimize}
      // Panels hold state (chat, exercise player, forms) — don't reset it
      // every time the sheet is minimized.
      ModalProps={{ keepMounted: true }}
      // Sizing via sx: MUI's paper styles are injected after CSS modules
      PaperProps={{ sx: isBottom ? SHEET_BOTTOM_SX : SHEET_SIDE_SX }}
    >
      {isBottom && <div className={styles.handle} aria-hidden="true" />}
      <Box className={styles.header}>
        <Typography variant="subtitle1" component="h2" noWrap>
          {title}
        </Typography>
        <Box sx={{ display: "flex", flex: "none" }}>
          <Tooltip title="Minimize panel">
            <IconButton aria-label="Minimize panel" onClick={onMinimize}>
              <MinimizeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close panel">
            <IconButton aria-label="Close panel" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <div className={styles.body}>{children}</div>
    </Drawer>
  );
};

export default PanelSheet;
