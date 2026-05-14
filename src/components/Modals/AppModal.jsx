import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AppModal = ({
  open,
  onClose,
  title,
  maxWidth = "lg",
  fullWidth = true,
  scroll = "paper",
  actions,
  children,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth={maxWidth}
    fullWidth={fullWidth}
    scroll={scroll}
  >
    <DialogTitle sx={{ pr: 6, pb: 4 }}>
      {title}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent dividers>{children}</DialogContent>

    {actions && <DialogActions>{actions}</DialogActions>}
  </Dialog>
);

export default AppModal;
