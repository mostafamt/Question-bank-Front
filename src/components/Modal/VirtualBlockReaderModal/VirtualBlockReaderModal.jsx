import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Button from "@mui/material/Button";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { OpenInNew, Visibility, PlayArrow } from "@mui/icons-material";
import { useStore } from "../../../store/store";
import { toast } from "react-toastify";
import { getObjectUrl } from "../../../utils/object-url";

import styles from "./virtualBlockReaderModal.module.scss";

/**
 * VirtualBlockReaderModal Component
 * Read-only modal for viewing/playing multiple content items in reader mode
 *
 * @param {Object} props
 * @param {string} props.blockLabel - The block label (e.g., "Notes 📝")
 * @param {Array} props.contents - Array of content items to display
 * @param {Function} props.handleCloseModal - Close modal callback
 */
const VirtualBlockReaderModal = (props) => {
  const { blockLabel = "", contents = [], handleCloseModal } = props;

  const { openModal } = useStore();

  // Loading state for fetching object URLs
  const [loadingObjectUrl, setLoadingObjectUrl] = React.useState(false);

  console.log("VirtualBlockReaderModal opened with:", {
    blockLabel,
    contents,
  });

  /**
   * Get display icon for content type
   */
  const getTypeIcon = (type) => {
    switch (type) {
      case "text":
        return "📄";
      case "link":
        return "🔗";
      case "object":
        return "🎮";
      default:
        return "📋";
    }
  };

  /**
   * Get display label for content type
   */
  const getTypeLabel = (type) => {
    switch (type) {
      case "text":
        return "Text";
      case "link":
        return "Link";
      case "object":
        return "Interactive Object";
      default:
        return "Unknown";
    }
  };

  /**
   * Get action button label
   */
  const getActionLabel = (type) => {
    switch (type) {
      case "text":
        return "View";
      case "link":
        return "Open";
      case "object":
        return "Play";
      default:
        return "View";
    }
  };

  /**
   * Get action button icon
   */
  const getActionIcon = (type) => {
    switch (type) {
      case "text":
        return <Visibility />;
      case "link":
        return <OpenInNew />;
      case "object":
        return <PlayArrow />;
      default:
        return <Visibility />;
    }
  };

  /**
   * Get preview of content value
   */
  const getContentPreview = (item) => {
    const maxLength = 150;

    switch (item.type) {
      case "text":
        // Strip HTML tags for preview
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = item.contentValue;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        return textContent.length > maxLength
          ? textContent.substring(0, maxLength) + "..."
          : textContent;

      case "link":
        return item.contentValue;

      case "object":
        return `Interactive Object ID: ${item.contentValue}`;

      default:
        return "No preview available";
    }
  };

  /**
   * Handle viewing/playing a content item
   */
  const handleViewContent = async (item) => {
    switch (item.type) {
      case "text":
        // Text content - open text viewer (read-only)
        console.log("Opening text content in text editor");
        openModal("text-editor", {
          value: item.contentValue,
          title: item.contentType,
          onClickSubmit: null, // Read-only
        });
        break;

      case "link":
        // Link content - open in iframe
        console.log("Opening link content in iframe:", item.contentValue);
        openModal("iframe-display", {
          title: item.contentType,
          url: item.contentValue,
        });
        break;

      case "object":
        // Object content - fetch URL and open in iframe
        console.log("Fetching URL for object:", item.contentValue);
        setLoadingObjectUrl(true);
        try {
          const url = await getObjectUrl(item.contentValue);
          console.log("Object URL retrieved:", url);

          openModal("iframe-display", {
            title: item.contentType,
            url: url,
          });
        } catch (error) {
          console.error("Failed to load object URL:", error);
          toast.error(`Failed to load interactive object: ${error.message}`);
        } finally {
          setLoadingObjectUrl(false);
        }
        break;

      default:
        console.warn("Unknown content type:", item.type);
    }
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    if (handleCloseModal) {
      handleCloseModal();
    }
  };

  return (
    <div
      className={styles["virtual-block-reader-modal"]}
      role="dialog"
      aria-labelledby="reader-modal-title"
      aria-describedby="reader-modal-description"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="reader-modal-title">
          {blockLabel}
        </BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        {/* Loading Overlay for Object URL Fetching */}
        {loadingObjectUrl && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 9999,
              gap: 2,
            }}
            role="status"
            aria-live="assertive"
            aria-label="Loading interactive object"
          >
            <CircularProgress size={60} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white" }}>
              Loading interactive object...
            </Typography>
          </Box>
        )}

        <div
          className={styles.container}
          id="reader-modal-description"
          role="region"
          aria-label="Virtual block content items"
        >
          {contents.length === 0 ? (
            <Box
              className={styles.emptyState}
              role="status"
              aria-live="polite"
            >
              <Typography variant="body1" color="text.secondary">
                No content items available
              </Typography>
            </Box>
          ) : (
            <div
              className={styles.contentList}
              role="list"
              aria-label={`${contents.length} content items`}
            >
              {contents.map((item, index) => (
                <Card
                  key={index}
                  className={styles.contentCard}
                  variant="outlined"
                  role="listitem"
                  aria-label={`${getTypeLabel(item.type)} content item ${index + 1} of ${contents.length}`}
                >
                  <CardContent>
                    {/* Content Type Badge */}
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                      <Typography
                        variant="h6"
                        component="span"
                        role="img"
                        aria-label={getTypeLabel(item.type)}
                      >
                        {getTypeIcon(item.type)}
                      </Typography>
                      <Chip
                        label={getTypeLabel(item.type)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {/* Content Preview */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className={styles.preview}
                    >
                      {getContentPreview(item)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={getActionIcon(item.type)}
                      onClick={() => handleViewContent(item)}
                      fullWidth
                      aria-label={`${getActionLabel(item.type)} ${getTypeLabel(item.type).toLowerCase()} content`}
                    >
                      {getActionLabel(item.type)}
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </div>
          )}
        </div>
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleClose}
          aria-label="Close reader modal"
        >
          Close
        </Button>
      </BootstrapModal.Footer>
    </div>
  );
};

export default VirtualBlockReaderModal;
