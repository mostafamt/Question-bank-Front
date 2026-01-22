import React, { useState } from "react";
import { Box, CircularProgress, Alert, IconButton, Tooltip } from "@mui/material";
import { OpenInNew, Refresh } from "@mui/icons-material";

/**
 * IframeContentDisplay Component
 * Displays link/object content in iframe with toolbar controls
 *
 * @param {Object} props
 * @param {string} props.url - URL to display in iframe
 * @param {string} props.title - Content title
 */
const IframeContentDisplay = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "600px" }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={handleRefresh} aria-label="Refresh iframe">
            <Refresh />
          </IconButton>
        </Tooltip>
        <Tooltip title="Open in new tab">
          <IconButton size="small" onClick={handleOpenNewTab} aria-label="Open in new tab">
            <OpenInNew />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
          role="status"
          aria-live="polite"
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="error"
            action={
              <IconButton size="small" onClick={handleRefresh} aria-label="Retry">
                <Refresh />
              </IconButton>
            }
          >
            Failed to load content. Click to retry.
          </Alert>
        </Box>
      )}

      {/* Iframe */}
      <iframe
        key={iframeKey}
        src={url}
        title={title}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: "100%",
          height: "calc(100% - 48px)",
          border: "none",
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </Box>
  );
};

export default IframeContentDisplay;
