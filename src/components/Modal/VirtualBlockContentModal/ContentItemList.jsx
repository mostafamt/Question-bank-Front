import React from "react";
import IconButton from "@mui/material/IconButton";
import { Edit, Delete } from "@mui/icons-material";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";

import styles from "./virtualBlockContentModal.module.scss";

/**
 * ContentItemList Component
 * Displays list of content items with edit/delete actions
 *
 * @param {Object} props
 * @param {Array} props.contents - Array of content items
 * @param {Function} props.onEdit - Edit handler, receives index
 * @param {Function} props.onDelete - Delete handler, receives index
 */
const ContentItemList = (props) => {
  const { contents = [], onEdit, onDelete } = props;

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
        return `Object ID: ${item.contentValue}`;

      default:
        return "No preview available";
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
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEdit(index)}
                  aria-label="edit content"
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(index)}
                  aria-label="delete content"
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
