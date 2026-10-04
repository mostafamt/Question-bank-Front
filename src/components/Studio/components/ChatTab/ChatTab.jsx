import React from "react";
import { Box, Typography } from "@mui/material";

const ChatTab = ({ chapterId }) => {
  return (
    <Box p={2}>
      <Typography color="textSecondary">No messages yet.</Typography>
    </Box>
  );
};

export default ChatTab;
