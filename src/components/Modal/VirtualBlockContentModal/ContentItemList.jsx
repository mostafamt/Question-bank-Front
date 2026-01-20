import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { Edit, Delete, PlayArrow } from "@mui/icons-material";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { toast } from "react-toastify";

import { useStore } from "../../../store/store";
import { getObjectUrl } from "../../../utils/object-url";
import { getObject } from "../../../api/bookapi";
import styles from "./virtualBlockContentModal.module.scss";

/**
 * ContentItemList Component
 * Displays list of content items with play/edit/delete actions
 *
 * @param {Object} props
 * @param {Array} props.contents - Array of content items
 * @param {string} props.selectedLabel - The block label (e.g., "Notes 📝")
 * @param {Function} props.onEdit - Edit handler, receives index
 * @param {Function} props.onDelete - Delete handler, receives index
 */
const ContentItemList = (props) => {
  const { contents = [], selectedLabel = "", onEdit, onDelete } = props;

  // Get openModal function from Zustand store
  const openModal = useStore((state) => state.openModal);

  // Track loading state for object URL fetching (play button)
  const [loadingIndex, setLoadingIndex] = useState(null);

  // Track object metadata and loading state
  const [objectMetadata, setObjectMetadata] = useState({});
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  /**
   * Fetch metadata for all object-type items on mount
   */
  useEffect(() => {
    const fetchObjectMetadata = async () => {
      // Filter out object-type items
      const objectItems = contents.filter((item) => item.type === "object");

      // If no objects, set loading to false and return
      if (objectItems.length === 0) {
        setLoadingMetadata(false);
        return;
      }

      setLoadingMetadata(true);

      try {
        // Fetch all objects in parallel
        const promises = objectItems.map((item) =>
          getObject(item.contentValue)
            .then((data) => ({ id: item.contentValue, data }))
            .catch((err) => ({ id: item.contentValue, error: err }))
        );

        const results = await Promise.all(promises);

        // Build metadata map
        const metadataMap = {};
        results.forEach((result) => {
          if (result.data && result.data._id) {
            metadataMap[result.id] = {
              name: result.data.questionName || "Unnamed Object",
              type: result.data.type || result.data.baseType || "Unknown Type",
              domain: result.data.domainName || "",
              subDomain: result.data.subDomainName || "",
            };
          }
        });

        setObjectMetadata(metadataMap);
      } catch (error) {
        console.error("Error fetching object metadata:", error);
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchObjectMetadata();
  }, [contents]);

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
        return "Object";
      default:
        return "Unknown";
    }
  };

  /**
   * Get preview of content value
   */
  const getContentPreview = (item) => {
    const maxLength = 100;

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
        // Get metadata for this object
        const metadata = objectMetadata[item.contentValue];

        // Loading state
        if (loadingMetadata) {
          return "Loading object details...";
        }

        // Display metadata if available
        if (metadata) {
          const objectName =
            metadata.name.length > maxLength
              ? metadata.name.substring(0, maxLength) + "..."
              : metadata.name;

          // Build type and domain string
          let typeInfo = `Type: ${metadata.type}`;
          if (metadata.domain) {
            typeInfo += ` • ${metadata.domain}`;
          }

          return (
            <>
              <strong>{objectName}</strong>
              <br />
              <span style={{ fontSize: "0.85em" }}>{typeInfo}</span>
            </>
          );
        }

        // Fallback if metadata not available
        return `Object ID: ${item.contentValue}`;

      default:
        return "No preview available";
    }
  };

  /**
   * Handle play/preview content item
   * Opens appropriate modal based on content type
   */
  const handlePlay = async (index) => {
    const item = contents[index];
    const title = `${selectedLabel} - Preview`;

    try {
      if (item.type === "text") {
        // Open text editor modal in read-only mode
        openModal("text-editor", {
          value: item.contentValue,
          title,
          onClickSubmit: null, // Read-only mode
        });
      } else if (item.type === "link") {
        // Open iframe modal with link URL
        openModal("iframe-display", {
          title,
          url: item.contentValue,
        });
      } else if (item.type === "object") {
        // Fetch object URL then open iframe modal
        setLoadingIndex(index);
        try {
          const url = await getObjectUrl(item.contentValue);
          if (url) {
            openModal("iframe-display", {
              title,
              url,
            });
          } else {
            toast.error("Unable to load object. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching object URL:", error);
          toast.error("Failed to load object preview.");
        } finally {
          setLoadingIndex(null);
        }
      }
    } catch (error) {
      console.error("Error playing content:", error);
      toast.error("Failed to open preview.");
      setLoadingIndex(null);
    }
  };

  return (
    <div className={styles["content-list"]}>
      {contents.map((item, index) => (
        <Card key={index} className={styles["content-item"]} variant="outlined">
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box flex={1}>
                {/* Content Type Badge */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="body2" component="span">
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
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={0.5}>
                {/* Play Button */}
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handlePlay(index)}
                  disabled={loadingIndex === index}
                  aria-label="preview content"
                  title="Preview content"
                >
                  {loadingIndex === index ? (
                    <CircularProgress size={20} />
                  ) : (
                    <PlayArrow fontSize="small" />
                  )}
                </IconButton>

                {/* Edit Button */}
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEdit(index)}
                  aria-label="edit content"
                  title="Edit content"
                >
                  <Edit fontSize="small" />
                </IconButton>

                {/* Delete Button */}
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(index)}
                  aria-label="delete content"
                  title="Delete content"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContentItemList;
