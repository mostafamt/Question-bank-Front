import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import AppModal from "../AppModal";
import DrawnUIForm from "../../DrawnUI/DrawnUIForm/DrawnUIForm";
import AreaList from "./AreaList/AreaList";

const DrawnUIModal = ({
  open,
  onClose,
  baseType,
  displayType,
  initialValues,
  initialColors,
  trialAreas,
  isMapToFormMode,
  objectId,
}) => (
  <AppModal open={open} onClose={onClose} title={displayType} maxWidth="lg">
    <Box sx={{ display: "flex", p: 0, overflow: "hidden", m: -3 }}>
      {/* Left: DrawnUI form */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        <DrawnUIForm
          baseType={baseType}
          initialValues={initialValues}
          initialColors={initialColors}
          objectId={objectId ?? null}
          onSuccess={onClose}
          isMapToFormMode={isMapToFormMode}
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
    </Box>
  </AppModal>
);

export default DrawnUIModal;
