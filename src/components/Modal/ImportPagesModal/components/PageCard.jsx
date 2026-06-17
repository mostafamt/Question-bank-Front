import React from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const PageCard = ({ page, index, isSelected, onToggle }) => {
  const pageId = page._id || index;

  return (
    <Box
      onClick={() => onToggle(pageId)}
      sx={{ position: "relative", cursor: "pointer" }}
    >
      <Box
        component="img"
        src={page.url}
        alt={`Page ${index + 1}`}
        sx={{
          width: "100%",
          aspectRatio: "3/4",
          objectFit: "cover",
          borderRadius: 1,
          border: "2px solid",
          borderColor: isSelected ? "primary.main" : "transparent",
          "&:hover": { borderColor: "primary.main" },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          bottom: 4,
          left: 0,
          right: 0,
          textAlign: "center",
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          py: 0.25,
        }}
      >
        {index + 1}
      </Typography>
      {isSelected && (
        <CheckCircleIcon
          color="primary"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            bgcolor: "white",
            borderRadius: "50%",
          }}
        />
      )}
    </Box>
  );
};

export default PageCard;
