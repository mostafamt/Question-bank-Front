import React, { useEffect } from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Box, Button, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import useVirtualBlockNavigation from "../../../hooks/useVirtualBlockNavigation";
import TextContentDisplay from "./TextContentDisplay";
import IframeContentDisplay from "./IframeContentDisplay";
import ObjectContentDisplay from "./ObjectContentDisplay";

import styles from "./virtualBlockReaderNavigationModal.module.scss";

/**
 * VirtualBlockReaderNavigationModal Component
 * Displays virtual block content with Previous/Next navigation
 * Allows linear navigation through items within a single virtual block
 *
 * @param {Object} props
 * @param {string} props.blockLabel - Block label (e.g., "Notes 📝")
 * @param {Array} props.contents - Array of content items
 * @param {number} props.initialIndex - Starting index (default 0)
 * @param {Function} props.handleCloseModal - Close callback
 */
const VirtualBlockReaderNavigationModal = (props) => {
  const {
    blockLabel = "",
    contents = [],
    initialIndex = 0,
    handleCloseModal,
  } = props;

  const {
    currentItem,
    currentIndex,
    totalItems,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
  } = useVirtualBlockNavigation(contents, initialIndex);

  console.log("VirtualBlockReaderNavigationModal:", {
    blockLabel,
    totalItems,
    currentIndex,
    currentItem,
  });

  // Optional: Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if no input/textarea is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable;

      if (isInputFocused) return;

      if (e.key === "ArrowLeft" && hasPrevious) {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPrevious, hasNext, goToPrevious, goToNext, handleCloseModal]);

  /**
   * Render content based on type
   */
  const renderContent = () => {
    if (!currentItem) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary">No content available</Typography>
        </Box>
      );
    }

    switch (currentItem.type) {
      case "text":
        return (
          <TextContentDisplay
            value={currentItem.contentValue}
            title={currentItem.contentType}
          />
        );

      case "link":
        return (
          <IframeContentDisplay
            url={currentItem.contentValue}
            title={currentItem.contentType}
          />
        );

      case "object":
        return (
          <ObjectContentDisplay
            objectId={currentItem.contentValue}
            title={currentItem.contentType}
          />
        );

      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography color="error">
              Unknown content type: {currentItem.type}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <div
      className={styles["vb-nav-modal"]}
      role="dialog"
      aria-labelledby="vb-nav-modal-title"
      aria-describedby="vb-nav-modal-content"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title id="vb-nav-modal-title">
          {blockLabel}
        </BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body id="vb-nav-modal-content">
        {renderContent()}
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Previous Button */}
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={goToPrevious}
            disabled={!hasPrevious}
            aria-label="Go to previous item"
            sx={{ minWidth: "120px" }}
          >
            Previous
          </Button>

          {/* Counter */}
          <Typography
            variant="body1"
            sx={{ fontWeight: "medium", fontSize: "1.1rem" }}
            aria-live="polite"
            aria-atomic="true"
          >
            {currentIndex + 1} of {totalItems}
          </Typography>

          {/* Next Button */}
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            onClick={goToNext}
            disabled={!hasNext}
            aria-label="Go to next item"
            sx={{ minWidth: "120px" }}
          >
            Next
          </Button>
        </Box>
      </BootstrapModal.Footer>
    </div>
  );
};

export default VirtualBlockReaderNavigationModal;
