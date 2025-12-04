import React from "react";
import MuiSelect from "../../MuiSelect/MuiSelect";
import {
  CREATED,
  DELETED,
  NOTES,
  SUMMARY,
  VIRTUAL_BLOCK_MENU,
} from "../../../utils/virtual-blocks";
import IconButton from "@mui/material/IconButton";
import { DeleteForever } from "@mui/icons-material";
import axios from "../../../axios";
import { toast } from "react-toastify";
import { useStore } from "../../../store/store";
import clsx from "clsx";

import styles from "./virtualBlock.module.scss";

/**
 * VirtualBlock Component
 * Manages virtual blocks (notes, summaries, interactive objects) for book pages
 *
 * @param {Object} props
 * @param {Object} props.checkedObject - Currently selected virtual block
 * @param {Function} props.setCheckedObject - Update checked object state
 * @param {string} props.label - Block label identifier
 * @param {boolean} props.showVB - Whether to show the virtual block
 * @param {boolean} props.reader - Whether component is in reader mode
 * @param {Array} props.virtualBlocks - List of virtual blocks
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

  // Local state
  const [header, setHeader] = React.useState("");
  const [contentType, setContentType] = React.useState("");
  const [textValue, setTextValue] = React.useState("");
  const [objectName, setObjectName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Content type options
  const CONTENT_TYPES = ["text", "link", "object"];

  // Global store
  const { data: state, setFormState, openModal, closeModal } = useStore();

  /**
   * Fetch interactive object data by ID
   */
  const fetchObjectData = React.useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await axios.get(`/interactive-objects/${id}`);
      setObjectName(res.data?.questionName || "");
    } catch (error) {
      console.error("Failed to fetch object data:", error);
      toast.error(`Failed to load object: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load object data when checkedObject changes
   */
  React.useEffect(() => {
    const isTextBlock =
      checkedObject.label === NOTES || checkedObject.label === SUMMARY;

    if (showVB && !isTextBlock && checkedObject?.id) {
      fetchObjectData(checkedObject.id);
    }
  }, [checkedObject?.id, checkedObject?.label, fetchObjectData, showVB]);

  /**
   * Handle text block submission (Notes/Summary)
   */
  const handleTextBlockSubmit = React.useCallback(
    (blockType, content) => {
      // Update form state for text blocks
      setFormState({
        ...state,
        virtual_block_label: blockType,
        virtual_block_key: label,
      });

      // Update checked object with new content
      setCheckedObject({
        label: blockType,
        id: content,
        status: CREATED,
        contentType: "text",
      });

      // Close modal
      closeModal();
    },
    [state, label, setFormState, setCheckedObject, closeModal]
  );

  /**
   * Handle link block submission
   */
  const handleLinkBlockSubmit = React.useCallback(
    (blockType, linkUrl) => {
      // Update form state for link blocks
      setFormState({
        ...state,
        virtual_block_label: blockType,
        virtual_block_key: label,
      });

      // Update checked object with new link
      setCheckedObject({
        label: blockType,
        id: linkUrl,
        status: CREATED,
        contentType: "link",
      });

      // Close modal
      closeModal();
    },
    [state, label, setFormState, setCheckedObject, closeModal]
  );

  /**
   * Open text editor modal for Notes/Summary
   */
  const openTextEditorModal = React.useCallback(
    (blockType, initialValue = "") => {
      openModal("text-editor", {
        value: initialValue,
        setValue: setTextValue,
        onClickSubmit: (content) => handleTextBlockSubmit(blockType, content),
      });
    },
    [openModal, handleTextBlockSubmit]
  );

  /**
   * Open link editor modal for link content
   */
  const openLinkEditorModal = React.useCallback(
    (blockType, initialLink = "") => {
      openModal("link-editor", {
        value: initialLink,
        onClickSubmit: (linkUrl) => handleLinkBlockSubmit(blockType, linkUrl),
      });
    },
    [openModal, handleLinkBlockSubmit]
  );

  /**
   * Open virtual blocks selection modal for interactive objects
   */
  const openVirtualBlocksModal = React.useCallback(
    (blockType) => {
      openModal("virtual-blocks", {
        virtualBlocks: virtualBlocks,
        setVirtualBlocks: setVirtualBlocks,
      });

      // Update form state for interactive objects
      setFormState({
        ...state,
        virtual_block_label: blockType,
        virtual_block_key: label,
      });

      // Update checked object
      setCheckedObject({
        label: blockType,
        id: checkedObject?.id || "",
        status: CREATED,
        contentType: "object",
      });
    },
    [
      openModal,
      virtualBlocks,
      setVirtualBlocks,
      setFormState,
      state,
      label,
      setCheckedObject,
      checkedObject?.id,
    ]
  );

  /**
   * Handle block type selection from dropdown
   */
  const handleBlockTypeChange = React.useCallback((e) => {
    const selectedType = e.target.value;
    setHeader(selectedType);
    // Reset content type when block type changes
    setContentType("");
  }, []);

  /**
   * Handle content type selection from second dropdown
   */
  const handleContentTypeChange = React.useCallback(
    (e) => {
      const selectedContentType = e.target.value;
      setContentType(selectedContentType);

      // Route to appropriate modal based on content type
      switch (selectedContentType) {
        case "text":
          // Open text editor modal
          openTextEditorModal(header, textValue);
          break;
        case "link":
          // Open link editor modal
          openLinkEditorModal(header, "");
          break;
        case "object":
          // Open virtual blocks modal for interactive objects
          openVirtualBlocksModal(header);
          break;
        default:
          break;
      }
    },
    [
      header,
      textValue,
      openTextEditorModal,
      openLinkEditorModal,
      openVirtualBlocksModal,
    ]
  );

  /**
   * Handle delete/close button click
   */
  const handleDelete = React.useCallback(() => {
    setHeader("");
    setCheckedObject({
      ...checkedObject,
      status: DELETED,
    });
  }, [checkedObject, setCheckedObject]);

  /**
   * Handle play button click (edit mode)
   */
  const handlePlayEdit = React.useCallback(() => {
    const contentType = checkedObject.contentType || "";

    // Route based on content type
    if (contentType === "text") {
      // Open text editor with existing content
      openTextEditorModal(checkedObject.label, checkedObject.id);
    } else if (contentType === "link") {
      // Open link editor with existing link
      openLinkEditorModal(checkedObject.label, checkedObject.id);
    } else if (contentType === "object") {
      // Open interactive object player
      openModal("play-object-2", {});
      setFormState({
        ...state,
        activeId: checkedObject?.id,
      });
    } else {
      // Fallback for legacy blocks without contentType
      const isTextBlock =
        checkedObject.label === NOTES || checkedObject.label === SUMMARY;

      if (isTextBlock) {
        openTextEditorModal(checkedObject.label, checkedObject.id);
      } else {
        openModal("play-object-2", {});
        setFormState({
          ...state,
          activeId: checkedObject?.id,
        });
      }
    }
  }, [
    checkedObject,
    openTextEditorModal,
    openLinkEditorModal,
    openModal,
    setFormState,
    state,
  ]);

  /**
   * Handle play button click (reader mode)
   */
  const handlePlayReader = React.useCallback(() => {
    const contentType = checkedObject.contentType || "";

    if (contentType === "link") {
      // Open link in new tab for reader mode
      window.open(checkedObject.id, "_blank", "noopener,noreferrer");
    } else if (contentType === "text") {
      // Show text content in modal
      openModal("text-viewer", {
        content: checkedObject.id,
        title: checkedObject.label,
      });
    } else {
      // Open interactive object player (default behavior)
      openModal("play-object", {
        id: checkedObject.id,
      });
    }
  }, [checkedObject, openModal]);

  /**
   * Get icon for selected virtual block type
   */
  const selectedBlockIcon = React.useMemo(() => {
    const selectedItem = VIRTUAL_BLOCK_MENU.find(
      (item) => item.label === checkedObject?.label
    );
    return selectedItem?.iconSrc;
  }, [checkedObject?.label]);

  /**
   * Get display label without emoji
   */
  const displayLabel = React.useMemo(() => {
    if (!checkedObject?.label) return "";
    return checkedObject.label
      .replace(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu, "")
      .trim();
  }, [checkedObject?.label]);

  // Don't render if virtual blocks are hidden
  if (!showVB) {
    return null;
  }

  // Check if block exists and is not deleted
  const hasActiveBlock =
    checkedObject?.status && checkedObject.status !== DELETED;

  /**
   * Render active virtual block
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
                disabled={loading}
              >
                <DeleteForever color="error" />
              </IconButton>
            </div>
          )}

          {/* Block icon and label */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <IconButton
              color="primary"
              aria-label="play virtual block"
              onClick={reader ? handlePlayReader : handlePlayEdit}
              sx={{ padding: 0 }}
              disabled={loading}
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
            value={header}
            onChange={handleBlockTypeChange}
            disabled={loading}
          />
        </div>
        {header && (
          <div className={styles["select"]}>
            <MuiSelect
              list={CONTENT_TYPES}
              value={contentType}
              onChange={handleContentTypeChange}
              disabled={loading}
            />
          </div>
        )}
      </div>
    );
  }

  // Reader mode with no active block - render nothing
  return null;
};

export default VirtualBlock;
