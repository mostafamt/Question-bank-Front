import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DrawnUIForm from "../DrawnUI/DrawnUIForm/DrawnUIForm";
import AreaList from "./AreaList/AreaList";

const DrawnUIModal = ({
  open,
  onClose,
  baseType,
  displayType,
  initialValues,
  initialColors,
  trialAreas,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="paper">
    {console.log("initialValues= ", initialValues)}
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

    <DialogContent dividers sx={{ display: "flex", p: 0, overflow: "hidden" }}>
      {/* Left: DrawnUI form */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        <DrawnUIForm
          baseType={baseType}
          initialValues={initialValues}
          initialColors={initialColors}
          objectId={null}
          onSuccess={onClose}
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Right: draggable area cards */}
      <Box sx={{ width: 300, flexShrink: 0, overflowY: "auto", p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1.5, color: "text.secondary", fontWeight: 600 }}
        >
          Scanned Areas
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 2, color: "text.disabled" }}
        >
          Drag a card and drop it onto a text field to fill it.
        </Typography>
        <AreaList trialAreas={trialAreas} />
      </Box>
    </DialogContent>
  </Dialog>
);

export default DrawnUIModal;
