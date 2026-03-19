import React, { useRef } from "react";
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
import { toast } from "react-toastify";
import { getObjectUrl } from "../../../utils/object-url";
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
 */
const VirtualBlock = React.memo((props) => {
  const {
    checkedObject,
    setCheckedObject,
    label,
    showVB,
    reader,
  } = props;

  // Global store
  const { openModal, closeModal } = useStore();

  // Use ref to access current contents without causing dependency changes
  const contentsRef = useRef(checkedObject?.contents);
  contentsRef.current = checkedObject?.contents;

  /**
   * Handle save contents from VirtualBlockContentModal
   * Uses closeModal first, then defers state update to prevent re-render loop
   */
  const handleSaveContents = React.useCallback(
    (contents) => {
      // Close modal first to prevent re-render during modal unmount
      closeModal();

      // Defer state update to next tick to avoid render loop
      requestAnimationFrame(() => {
        setCheckedObject({
          contents: contents,
        });
      });
    },
    [setCheckedObject, closeModal]
  );

  /**
   * Handle label selection - opens VirtualBlockContentModal
   * Uses ref for contents to avoid unstable dependency
   */
  const handleLabelSelect = React.useCallback(
    (selectedLabel) => {
      // Get existing contents from ref (stable reference)
      const existingContents = contentsRef.current || [];

      // Open modal with selected label and existing contents
      openModal("virtual-block-content", {
        selectedLabel: selectedLabel,
        iconLocation: label,
        existingContents: existingContents,
        onSave: handleSaveContents,
      });
    },
    [label, openModal, handleSaveContents]
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
   * Uses ref for contents to avoid unstable dependency
   */
  const handleEdit = React.useCallback(() => {
    const contents = contentsRef.current;
    if (!contents || contents.length === 0) {
      return;
    }

    // Get the label from first content item
    const firstContent = contents[0];
    const blockLabel = firstContent.contentType;

    // Open modal with existing contents
    openModal("virtual-block-content", {
      selectedLabel: blockLabel,
      iconLocation: label,
      existingContents: contents,
      onSave: handleSaveContents,
    });
  }, [label, openModal, handleSaveContents]);

  /**
   * Handle play button click in reader mode
   * Opens modal to view all content items
   * For single items: displays directly in appropriate modal (text-editor or iframe-display)
   * For multiple items: opens reader modal with list
   * Uses ref for contents to avoid unstable dependency
   */
  const handlePlayReader = React.useCallback(async () => {
    const contents = contentsRef.current;
    if (!contents || contents.length === 0) {
      return;
    }

    // If only one item, play it directly
    if (contents.length === 1) {
      const item = contents[0];

      if (item.type === "link") {
        // Open link in iframe display modal
        openModal("iframe-display", {
          title: item.contentType,
          url: item.contentValue,
        });
      } else if (item.type === "text") {
        // Show text content in modal
        openModal("text-editor", {
          value: item.contentValue,
          title: item.contentType,
          onClickSubmit: null, // Read-only
        });
      } else if (item.type === "object") {
        // Fetch URL and open in iframe display modal
        try {
          const url = await getObjectUrl(item.contentValue);
          openModal("iframe-display", {
            title: item.contentType,
            url: url,
          });
        } catch (error) {
          toast.error("Failed to load interactive object");
          console.error("Object URL fetch error:", error);
        }
      }
    } else {
      // Multiple items - open navigation modal
      const blockLabel = contents[0].contentType;
      openModal("virtual-block-reader-nav", {
        blockLabel: blockLabel,
        contents: contents,
        initialIndex: 0, // Start from first item
      });
    }
  }, [openModal]);

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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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

  // Reader mode with no active block - render empty placeholder to maintain grid layout
  return <div className={clsx(styles["virtual-block"], styles["reader"])} />;
});

VirtualBlock.displayName = "VirtualBlock";

export default VirtualBlock;
