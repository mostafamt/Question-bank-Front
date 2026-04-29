import React from "react";
import { Box, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

const stripPrefix = (parameter) => parameter?.replace(/^[*#]+/, "") ?? "";

const AreaList = ({ trialAreas = [] }) => {
  const sorted = [...trialAreas].sort((a, b) => a.order - b.order);

  if (sorted.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
        No areas available.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {sorted.map((area) => (
        <Box
          key={area.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", area.text ?? "");
            e.dataTransfer.setData("application/x-area-color", area.color ?? "");
            e.dataTransfer.effectAllowed = "copy";
          }}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            p: 1.5,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            borderLeft: `4px solid ${area.color ?? "#ccc"}`,
            cursor: "grab",
            bgcolor: "background.paper",
            "&:active": { cursor: "grabbing" },
            userSelect: "none",
          }}
        >
          <DragIndicatorIcon
            fontSize="small"
            sx={{ color: "text.disabled", mt: 0.25, flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "text.secondary", display: "block" }}
            >
              {stripPrefix(area.parameter)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                wordBreak: "break-word",
                color: area.text ? "text.primary" : "text.disabled",
                fontStyle: area.text ? "normal" : "italic",
              }}
            >
              {area.text || "(no text)"}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default AreaList;
