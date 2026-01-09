import React from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import {
  CREATED,
  DELETED,
  VIRTUAL_BLOCK_MENU,
} from "../../../utils/virtual-blocks";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { DeleteForever } from "@mui/icons-material";
import { useStore } from "../../../store/store";
import clsx from "clsx";

import styles from "./virtualBlock.module.scss";

/**
 * VirtualBlock Component
 * Manages virtual blocks (notes, summaries, interactive objects) for book pages
 * Now supports multiple content items per location
 *
 * @param {Object} props
 * @param {Object} props.checkedObject - Currently selected virtual block with contents array
 * @param {Function} props.setCheckedObject - Update checked object state
 * @param {string} props.label - Block label identifier (icon location)
 * @param {boolean} props.showVB - Whether to show the virtual block
 * @param {boolean} props.reader - Whether component is in reader mode
 * @param {Object} props.virtualBlocks - All virtual blocks
 * @param {Function} props.setVirtualBlocks - Update virtual blocks list
 */
const VirtualBlock = (props) => {
  const {
    checkedObject,
    setCheckedObject,
    label,
    showVB,
    reader,
    virtualBlocks,
    setVirtualBlocks,
  } = props;

  // Global store
  const { openModal, closeModal } = useStore();

  console.log("VirtualBlock render:", {
    label,
    checkedObject,
    hasContents: checkedObject?.contents?.length > 0,
  });

  /**
   * Handle save contents from VirtualBlockContentModal
   */
  const handleSaveContents = React.useCallback(
    (contents) => {
      console.log("Saving contents:", contents);

      // Update checked object with new contents array
      setCheckedObject({
        contents: contents,
      });

      // Close modal
      closeModal();
    },
    [setCheckedObject, closeModal]
  );

  /**
   * Handle label selection - opens VirtualBlockContentModal
   */
  const handleLabelSelect = React.useCallback(
    (selectedLabel) => {
      console.log("Label selected:", selectedLabel);

      // Get existing contents for this location
      const existingContents = checkedObject?.contents || [];

      // Open modal with selected label and existing contents
      openModal("virtual-block-content", {
        selectedLabel: selectedLabel,
        iconLocation: label,
        existingContents: existingContents,
        onSave: handleSaveContents,
      });
    },
    [label, checkedObject?.contents, openModal, handleSaveContents]
  );

  /**
   * Handle block type change from dropdown
   */
  const handleBlockTypeChange = React.useCallback(
    (e) => {
      const selectedLabel = e.target.value;
      if (selectedLabel) {
        handleLabelSelect(selectedLabel);
      }
    },
    [handleLabelSelect]
  );

  /**
   * Handle delete/clear button click
   */
  const handleDelete = React.useCallback(() => {
    setCheckedObject({
      contents: [],
    });
  }, [setCheckedObject]);

  /**
   * Handle edit button click - opens modal to edit contents
   */
  const handleEdit = React.useCallback(() => {
    if (!checkedObject?.contents || checkedObject.contents.length === 0) {
      return;
    }

    // Get the label from first content item
    const firstContent = checkedObject.contents[0];
    const blockLabel = firstContent.contentType;

    // Open modal with existing contents
    openModal("virtual-block-content", {
      selectedLabel: blockLabel,
      iconLocation: label,
      existingContents: checkedObject.contents,
      onSave: handleSaveContents,
    });
  }, [checkedObject?.contents, label, openModal, handleSaveContents]);

  /**
   * Handle play button click in reader mode
   * Opens modal to view all content items
   */
  const handlePlayReader = React.useCallback(() => {
    if (!checkedObject?.contents || checkedObject.contents.length === 0) {
      return;
    }

    // If only one item, play it directly
    if (checkedObject.contents.length === 1) {
      const item = checkedObject.contents[0];

      if (item.type === "link") {
        // Open link in new tab
        window.open(item.contentValue, "_blank", "noopener,noreferrer");
      } else if (item.type === "text") {
        // Show text content in modal
        openModal("text-editor", {
          value: item.contentValue,
          title: item.contentType,
          onClickSubmit: null, // Read-only
        });
      } else if (item.type === "object") {
        // Open interactive object player
        openModal("play-object", {
          id: item.contentValue,
        });
      }
    } else {
      // Multiple items - open reader modal
      const blockLabel = checkedObject.contents[0].contentType;
      openModal("virtual-block-reader", {
        blockLabel: blockLabel,
        contents: checkedObject.contents,
      });
    }
  }, [checkedObject?.contents, openModal]);

  /**
   * Get icon for selected virtual block type
   */
  const selectedBlockIcon = React.useMemo(() => {
    if (!checkedObject?.contents || checkedObject.contents.length === 0) {
      return null;
    }

    const firstContent = checkedObject.contents[0];
    const selectedItem = VIRTUAL_BLOCK_MENU.find(
      (item) => item.label === firstContent.contentType
    );
    return selectedItem?.iconSrc;
  }, [checkedObject?.contents]);

  /**
   * Get display label without emoji
   */
  const displayLabel = React.useMemo(() => {
    if (!checkedObject?.contents || checkedObject.contents.length === 0) {
      return "";
    }

    const firstContent = checkedObject.contents[0];
    const label = firstContent.contentType || "";
    return label.replace(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu, "").trim();
  }, [checkedObject?.contents]);

  /**
   * Get content count
   */
  const contentCount = React.useMemo(() => {
    return checkedObject?.contents?.length || 0;
  }, [checkedObject?.contents]);

  // Don't render if virtual blocks are hidden
  if (!showVB) {
    return null;
  }

  // Check if block has active contents
  const hasActiveBlock = contentCount > 0;

  /**
   * Render active virtual block with icon and badge
   */
  if (hasActiveBlock) {
    return (
      <div className={clsx(styles["virtual-block"], styles["reader"])}>
        <div className={styles.block}>
          {/* Delete button - only show in edit mode */}
          {!reader && (
            <div className={styles.header}>
              <IconButton
                color="inherit"
                aria-label="delete virtual block"
                size="small"
                onClick={handleDelete}
              >
                <DeleteForever color="error" />
              </IconButton>
            </div>
          )}

          {/* Block icon with badge and label */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Badge
              badgeContent={contentCount}
              color="primary"
              overlap="circular"
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <IconButton
                color="primary"
                aria-label="view virtual block"
                onClick={reader ? handlePlayReader : handleEdit}
                sx={{ padding: 0 }}
              >
                {selectedBlockIcon && (
                  <img
                    src={selectedBlockIcon}
                    alt={displayLabel}
                    width="50px"
                    loading="lazy"
                  />
                )}
              </IconButton>
            </Badge>
            <div>{displayLabel}</div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render block type selector (edit mode only)
   */
  if (!reader) {
    return (
      <div className={clsx(styles["virtual-block"], styles["reader"])}>
        <div className={styles["select"]}>
          <MuiSelect
            list={VIRTUAL_BLOCK_MENU.map((item) => item.label)}
            value=""
            onChange={handleBlockTypeChange}
          />
        </div>
      </div>
    );
  }

  // Reader mode with no active block - render nothing
  return null;
};

export default VirtualBlock;
