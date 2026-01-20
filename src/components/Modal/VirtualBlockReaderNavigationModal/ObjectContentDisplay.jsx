import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Button } from "@mui/material";
import { getObjectUrl } from "../../../utils/object-url";
import IframeContentDisplay from "./IframeContentDisplay";

/**
 * ObjectContentDisplay Component
 * Fetches object URL and displays in iframe
 *
 * @param {Object} props
 * @param {string} props.objectId - Interactive object ID
 * @param {string} props.title - Content title
 */
const ObjectContentDisplay = ({ objectId, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUrl = await getObjectUrl(objectId);
        setUrl(fetchedUrl);
      } catch (err) {
        console.error("Failed to fetch object URL:", err);
        setError(err.message || "Failed to load object");
      } finally {
        setLoading(false);
      }
    };

    if (objectId) {
      fetchUrl();
    }
  }, [objectId]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    getObjectUrl(objectId)
      .then((fetchedUrl) => {
        setUrl(fetchedUrl);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load object");
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "600px",
          gap: 2,
        }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress size={60} />
        <Box sx={{ color: "text.secondary" }}>Loading interactive object...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (url) {
    return <IframeContentDisplay url={url} title={title} />;
  }

  return null;
};

export default ObjectContentDisplay;
