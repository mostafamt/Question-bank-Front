import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import {
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  Typography,
} from "@mui/material";
import { OpenInNew, Refresh, Close } from "@mui/icons-material";

import styles from "./iframeDisplayModal.module.scss";

/**
 * IframeDisplayModal Component
 * Displays content (links or objects) in an iframe for reader mode
 *
 * @param {Object} props
 * @param {string} props.title - Modal title
 * @param {string} props.url - URL to display in iframe
 * @param {Function} props.handleCloseModal - Close modal callback
 */
const IframeDisplayModal = (props) => {
  const { title = "Content", url, handleCloseModal } = props;

  console.log("IframeDisplayModal opened with:", { title, url });

  // State management
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);

  /**
   * Handle iframe load success
   */
  const handleLoad = () => {
    console.log("Iframe loaded successfully");
    setLoading(false);
    setError(false);
  };

  /**
   * Handle iframe load error
   */
  const handleError = (e) => {
    console.error("Iframe load error:", e);
    setLoading(false);
    setError(true);
  };

  /**
   * Refresh iframe by incrementing key
   */
  const handleRefresh = () => {
    console.log("Refreshing iframe");
    setLoading(true);
    setError(false);
    setIframeKey((prev) => prev + 1);
  };

  /**
   * Open URL in new browser tab
   */
  const handleOpenNewTab = () => {
    console.log("Opening in new tab:", url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    if (handleCloseModal) {
      handleCloseModal();
    }
  };

  /**
   * Validate URL
   */
  const isValidUrl = React.useMemo(() => {
    if (!url) return false;
    try {
      // Check if it's a valid URL or relative path
      if (url.startsWith("/")) return true; // Relative URL
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, [url]);

  return (
    <div
      className={styles["iframe-display-modal"]}
      role="dialog"
      aria-labelledby="iframe-modal-title"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="iframe-modal-title">
          {title}
        </BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        {/* Toolbar */}
        <Box className={styles.toolbar} role="toolbar" aria-label="Content controls">
          <Tooltip title="Refresh content" arrow>
            <IconButton
              onClick={handleRefresh}
              aria-label="Refresh content"
              size="small"
              disabled={!isValidUrl}
            >
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="Open in new tab" arrow>
            <IconButton
              onClick={handleOpenNewTab}
              aria-label="Open in new tab"
              size="small"
              disabled={!isValidUrl}
            >
              <OpenInNew />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Box className={styles.urlDisplay}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {url}
            </Typography>
          </Box>
        </Box>

        {/* Iframe Container */}
        <Box className={styles["iframe-container"]} role="region" aria-label="Content display">
          {/* Loading State */}
          {loading && (
            <Box
              className={styles.loading}
              role="status"
              aria-live="polite"
              aria-label="Loading content"
            >
              <CircularProgress size={60} />
              <Box mt={2}>Loading content...</Box>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Box className={styles.error}>
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleRefresh}
                    startIcon={<Refresh />}
                  >
                    Try Again
                  </Button>
                }
              >
                Failed to load content. The URL may be invalid or the content may not be
                accessible.
              </Alert>

              <Box mt={2}>
                <Button
                  variant="contained"
                  onClick={handleOpenNewTab}
                  startIcon={<OpenInNew />}
                  disabled={!isValidUrl}
                >
                  Open in New Tab
                </Button>
              </Box>
            </Box>
          )}

          {/* Invalid URL State */}
          {!isValidUrl && (
            <Box className={styles.error}>
              <Alert severity="warning">
                Invalid or missing URL. Please check the content configuration.
              </Alert>
            </Box>
          )}

          {/* Iframe */}
          {isValidUrl && (
            <iframe
              key={iframeKey}
              src={url}
              title={title}
              onLoad={handleLoad}
              onError={handleError}
              className={styles["content-iframe"]}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="lazy"
              aria-label={`${title} content frame`}
            />
          )}
        </Box>
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClose}
          startIcon={<Close />}
          aria-label="Close modal"
        >
          Close
        </Button>
      </BootstrapModal.Footer>
    </div>
  );
};

export default IframeDisplayModal;
