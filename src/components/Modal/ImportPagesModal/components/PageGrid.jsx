import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import PageCard from "./PageCard";

const PageGrid = ({ pages, isLoading, selectedPages, onToggle }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {selectedPages.length} page{selectedPages.length !== 1 ? "s" : ""} selected
      </Typography>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 1.5,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {pages?.map((page, idx) => (
            <PageCard
              key={page._id || idx}
              page={page}
              index={idx}
              isSelected={selectedPages.includes(page._id || idx)}
              onToggle={onToggle}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PageGrid;
