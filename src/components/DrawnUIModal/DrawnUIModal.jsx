import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DrawnUIForm from "../DrawnUI/DrawnUIForm/DrawnUIForm";

const DrawnUIModal = ({ open, onClose, baseType, displayType, initialValues }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
    <DialogTitle sx={{ pr: 6 }}>
      {displayType}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <DrawnUIForm
        baseType={baseType}
        initialValues={initialValues}
        objectId={null}
        onSuccess={onClose}
      />
    </DialogContent>
  </Dialog>
);

export default DrawnUIModal;
