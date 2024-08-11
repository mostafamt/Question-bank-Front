import { Alert, Box } from "@mui/material";
import React from "react";

const Wrapper = ({ children, space, hint }) => {
  const [showHint, setShowHint] = React.useState(Boolean(hint));

  return (
    <Box sx={{ mb: space }}>
      {showHint && (
        <Alert
          sx={{ mb: 1 }}
          severity="error"
          onClose={() => setShowHint((prevState) => !prevState)}
        >
          {hint}
        </Alert>
      )}
      {children}
    </Box>
  );
};

export default Wrapper;
