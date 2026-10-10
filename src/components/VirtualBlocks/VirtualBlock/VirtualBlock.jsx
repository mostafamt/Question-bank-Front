import React, { useRef } from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import {
  VIRTUAL_BLOCK_MENU,
  getVirtualBlockMenuItem,
} from "../../../utils/virtual-blocks";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {
  AddCircleOutline,
  DeleteForever,
  Edit,
  Person,
} from "@mui/icons-material";
import { useStore } from "../../../store/store";
import { toast } from "react-toastify";
import { getObjectUrl } from "../../../utils/object-url";
import { READER_VBLOCK_CONTENT_TYPES } from "../../Studio/constants";
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
 * @param {Object} [props.readerObject] - Reader's own block in this slot ({ contents })
 * @param {Function} [props.onSaveReaderSlot] - (location, contents) => void
 * @param {Function} [props.onDeleteReaderSlot] - (location) => void
 * @param {string} [props.pageImageUrl] - URL of the current page image (for AutoGen crop)
 */
const VirtualBlock = React.memo((props) => {
  const {
    checkedObject,
    setCheckedObject,
    label,
    showVB,
    reader,
    readerObject,
    onSaveReaderSlot,
    onDeleteReaderSlot,
    pageImageUrl,
  } = props;

  // Global store
  const { openModal, closeModal } = useStore();

  // Reader mode: author blocks win the slot; the reader may only use empty slots
  const hasAuthorContents = (checkedObject?.contents?.length || 0) > 0;
  const isReaderOwned =
    reader && !hasAuthorContents && (readerObject?.contents?.length || 0) > 0;
  const displayContents = isReaderOwned
    ? readerObject.contents
    : checkedObject?.contents;

  // Use ref to access current contents without causing dependency changes
  const contentsRef = useRef(displayContents);
  contentsRef.current = displayContents;

  // Reader add-menu anchor and delete confirmation
  const [addMenuAnchor, setAddMenuAnchor] = React.useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

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
        pageImageUrl: pageImageUrl,
        onSave: handleSaveContents,
      });
    },
    [label, openModal, handleSaveContents, pageImageUrl]
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
      pageImageUrl: pageImageUrl,
      onSave: handleSaveContents,
    });
  }, [label, openModal, handleSaveContents, pageImageUrl]);

  /**
   * Reader mode: save the reader's own contents for this slot
   * Same close-then-defer order as handleSaveContents
   */
  const handleSaveReaderContents = React.useCallback(
    (contents) => {
      closeModal();
      requestAnimationFrame(() => {
        onSaveReaderSlot?.(label, contents);
      });
    },
    [label, onSaveReaderSlot, closeModal]
  );

  /**
   * Reader mode: open the content modal limited to reader content types
   */
  const openReaderModal = React.useCallback(
    (selectedLabel, existingContents) => {
      openModal("virtual-block-content", {
        selectedLabel: selectedLabel,
        iconLocation: label,
        existingContents: existingContents,
        allowedTypes: READER_VBLOCK_CONTENT_TYPES,
        onSave: handleSaveReaderContents,
      });
    },
    [label, openModal, handleSaveReaderContents]
  );

  const handleReaderAddSelect = React.useCallback(
    (selectedLabel) => {
      setAddMenuAnchor(null);
      openReaderModal(selectedLabel, []);
    },
    [openReaderModal]
  );

  const handleReaderEdit = React.useCallback(() => {
    const contents = contentsRef.current;
    if (!contents || contents.length === 0) return;
    openReaderModal(contents[0].contentType, contents);
  }, [openReaderModal]);

  const handleReaderDeleteConfirm = React.useCallback(() => {
    setConfirmDeleteOpen(false);
    onDeleteReaderSlot?.(label);
  }, [label, onDeleteReaderSlot]);

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
    if (!displayContents || displayContents.length === 0) {
      return null;
    }

    return getVirtualBlockMenuItem(displayContents[0].contentType)?.iconSrc;
  }, [displayContents]);

  /**
   * Get display label without emoji
   */
  const displayLabel = React.useMemo(() => {
    if (!displayContents || displayContents.length === 0) {
      return "";
    }

    const firstContent = displayContents[0];
    const label = firstContent.contentType || "";
    return label.replace(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu, "").trim();
  }, [displayContents]);

  /**
   * Get content count
   */
  const contentCount = React.useMemo(() => {
    return displayContents?.length || 0;
  }, [displayContents]);

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
          {/* Reader's own block: "mine" marker + edit/delete */}
          {isReaderOwned && (
            <>
              <Tooltip title="Your block">
                <Person
                  className={styles["mine-marker"]}
                  fontSize="small"
                  color="primary"
                  aria-label="your block"
                />
              </Tooltip>
              <div className={styles.header}>
                <Tooltip title="Edit">
                  <IconButton
                    aria-label="edit virtual block"
                    size="small"
                    onClick={handleReaderEdit}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    aria-label="delete virtual block"
                    size="small"
                    onClick={() => setConfirmDeleteOpen(true)}
                  >
                    <DeleteForever fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </div>
              <Dialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                aria-labelledby={`delete-vblock-title-${label}`}
              >
                <DialogTitle id={`delete-vblock-title-${label}`}>
                  Delete this block?
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    {`"${displayLabel}" and its ${contentCount} item(s) will be removed. This can't be undone.`}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setConfirmDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="error" onClick={handleReaderDeleteConfirm}>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}

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
  // when this reader view doesn't support reader blocks (e.g. BookViewer)
  if (!onSaveReaderSlot) {
    return <div className={clsx(styles["virtual-block"], styles["reader"])} />;
  }

  // Otherwise an add button (same slot size keeps the grid layout)
  return (
    <div className={clsx(styles["virtual-block"], styles["reader"])}>
      <div className={styles["add"]}>
        <Tooltip title="Add your own block">
          <IconButton
            aria-label="add virtual block"
            aria-haspopup="menu"
            onClick={(e) => setAddMenuAnchor(e.currentTarget)}
          >
            <AddCircleOutline />
          </IconButton>
        </Tooltip>
      </div>
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={() => setAddMenuAnchor(null)}
      >
        {VIRTUAL_BLOCK_MENU.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => handleReaderAddSelect(item.label)}
          >
            {item.iconSrc && (
              <ListItemIcon>
                <img src={item.iconSrc} alt="" width="24px" loading="lazy" />
              </ListItemIcon>
            )}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
});

VirtualBlock.displayName = "VirtualBlock";

export default VirtualBlock;
