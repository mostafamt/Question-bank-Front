import React from "react";
import { IconButton } from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BorderStyleIcon from "@mui/icons-material/BorderStyle";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";

// large | medium | small
const iconFontSize = "medium";
// const text

const StudioActionsButtons = (props) => {
  const {
    onClickToggleVirutalBlocks,
    showVB,
    showBlocksStyling,
    onToggleBlocksStyling,
    isWhiteOutMode,
    onToggleWhiteOutMode,
  } = props;
  return (
    <div>
      <IconButton
        aria-label="visibility-icon"
        onClick={onClickToggleVirutalBlocks}
      >
        {showVB ? (
          <VisibilityOffIcon fontSize={iconFontSize} />
        ) : (
          <VisibilityIcon fontSize={iconFontSize} />
        )}
      </IconButton>
      <IconButton
        aria-label="toggle-blocks-styling"
        onClick={onToggleBlocksStyling}
        title={showBlocksStyling ? "Hide block borders" : "Show block borders"}
      >
        {showBlocksStyling ? (
          <BorderStyleIcon fontSize={iconFontSize} />
        ) : (
          <BorderStyleIcon fontSize={iconFontSize} sx={{ opacity: 0.4 }} />
        )}
      </IconButton>
      {onToggleWhiteOutMode && (
        <IconButton
          aria-label="toggle-white-out"
          onClick={onToggleWhiteOutMode}
          title={
            isWhiteOutMode
              ? "White-out mode on — draw a rectangle to white out content"
              : "White-out: draw a rectangle to permanently white out content"
          }
          sx={isWhiteOutMode ? { backgroundColor: "rgba(0, 0, 0, 0.08)" } : undefined}
        >
          <FormatColorResetIcon
            fontSize={iconFontSize}
            sx={!isWhiteOutMode ? { opacity: 0.4 } : undefined}
          />
        </IconButton>
      )}
    </div>
  );
};

export default StudioActionsButtons;
