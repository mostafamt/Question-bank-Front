import React from "react";
import { Box } from "@mui/material";

const FillInTheBlank = () => {
  return (
    <Box
      sx={{
        height: "200px",
        width: "100%",
        my: 2,
        overflow: "hidden",
      }}
    >
      <img
        src="/assets/question-bg-1.jpg"
        alt="question background"
        style={{
          postion: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
        }}
      />
    </Box>
  );
};

export default FillInTheBlank;
