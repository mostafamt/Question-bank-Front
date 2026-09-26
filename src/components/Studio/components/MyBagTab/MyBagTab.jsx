import React from "react";
import { Box, Typography } from "@mui/material";

const MyBagTab = ({ chapterId }) => {
  return (
    <Box p={2}>
      <Typography color="textSecondary">Your bag is empty.</Typography>
    </Box>
  );
};

export default MyBagTab;
