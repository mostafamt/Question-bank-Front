import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SaveIcon from "@mui/icons-material/Save";
import { Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { IconButton } from "@mui/material";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../store/store";
import { submitPages, addNewPage } from "../../../api/bookapi";
import { toast } from "react-toastify";

import styles from "./studioThumbnails.module.scss";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import { useAppMode, getTabById } from "../../../utils/tabFiltering";

const formatShortcut = ({ key, ctrlKey, altKey, shiftKey }) => {
  const parts = [];
  if (ctrlKey) parts.push("Ctrl");
  if (altKey) parts.push("Alt");
  if (shiftKey) parts.push("Shift");
  parts.push(key.length === 1 ? key.toUpperCase() : key);
  return parts.join("+");
};

const matchesShortcut = (e, shortcut) => {
  if (!shortcut) return false;
  return (
    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
    (e.ctrlKey || e.metaKey) === !!shortcut.ctrlKey &&
    e.altKey === !!shortcut.altKey &&
    e.shiftKey === !!shortcut.shiftKey
  );
};

const StudioThumbnails = React.forwardRef((props, ref) => {
  const {
    pages,
    setPages,
    addLocalPages,
    addEmptyPage,
    addImportedPages,
    insertPageLocally,
    onClickImage,
    activePage,
    onPageDeleted,
  } = props;

  const [clipboard, setClipboard] = React.useState(null);

  const queryClient = useQueryClient();
  const { openModal, modal } = useStore();
  const { bookId, chapterId } = useParams();

  const mode = useAppMode();
  const configuredActions = getTabById("thumbnails")?.actions ?? [];

  const containerRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const onChange = (event) => {
    addLocalPages?.(event.target.files, activePage);
  };

  const handleAddNewPage = async () => {
    try {
      const { pageId, url } = await addNewPage({ chapterId });
      addEmptyPage?.(activePage, { pageId, url });
    } catch {
      toast.error("Failed to create new page.");
    }
  };

  const handleSave = async () => {
    try {
      const pageIds = pages.map((p) => p._id).filter(Boolean);
      await submitPages({ pageIds, chapterId });
      setPages(pages.map((p) => ({ ...p, _isPending: false })));
      await queryClient.invalidateQueries({
        queryKey: [`book-${bookId}-chapter-${chapterId}`],
      });
      toast.success("Pages saved successfully.");
    } catch {
      toast.error("Failed to save pages.");
    }
  };

  const handleDeletePage = (pageIndex) => {
    setPages((prev) => prev.filter((_, i) => i !== pageIndex));
    onPageDeleted?.(pageIndex);
  };

  const handleCopy = () => {
    setClipboard({ page: pages[activePage], mode: "copy" });
  };

  const handleCut = () => {
    if (pages.length === 1) return;
    const page = pages[activePage];
    setPages((prev) => prev.filter((_, i) => i !== activePage));
    onPageDeleted?.(activePage);
    setClipboard({ page, mode: "cut" });
  };

  const handlePaste = () => {
    if (!clipboard) return;
    const insertAt = activePage + 1;
    const newPage = { ...clipboard.page, _isPending: true };
    insertPageLocally?.(insertAt, newPage);
    setClipboard(null);
  };

  const onClickImport = () => {
    openModal("import-pages", {
      bookId,
      chapterId,
      onPagesImported: (importedPages) =>
        addImportedPages(activePage, importedPages),
    });
  };

  React.useEffect(() => {
    if (containerRef.current && activePage !== null) {
      const container = containerRef.current;
      const img = container.children[activePage]; // direct access

      if (img) {
        const offset = container.clientHeight * 0.5; // 3% offset
        container.scrollTo({
          top: img.offsetTop - offset,
          behavior: "smooth",
        });
      }
    }
  }, [activePage, containerRef]);

  const thumbnailActions = [
    {
      label: "new",
      Icon: NoteAddIcon,
      onClick: handleAddNewPage,
      shortcut: { key: "n", ctrlKey: true, altKey: true },
    },
    {
      label: "add",
      Icon: AddPhotoAlternateIcon,
      isFileInput: true,
      disabled: true,
      shortcut: { key: "a", ctrlKey: true, shiftKey: true },
    },
    {
      label: "delete",
      Icon: DeleteIcon,
      onClick: () => handleDeletePage(activePage),
      shortcut: { key: "Delete" },
    },
    {
      label: "copy",
      Icon: ContentCopyIcon,
      onClick: handleCopy,
      shortcut: { key: "c", ctrlKey: true },
    },
    {
      label: "cut",
      Icon: ContentCutIcon,
      onClick: handleCut,
      disabled: pages.length === 1,
      shortcut: { key: "x", ctrlKey: true },
    },
    {
      label: "paste",
      Icon: ContentPasteIcon,
      onClick: handlePaste,
      disabled: !clipboard,
      shortcut: { key: "v", ctrlKey: true },
    },
    {
      label: "import",
      Icon: FileDownloadIcon,
      onClick: onClickImport,
      shortcut: { key: "i", ctrlKey: true, altKey: true },
    },
    {
      label: "save",
      Icon: SaveIcon,
      onClick: handleSave,
      shortcut: { key: "s", ctrlKey: true },
    },
  ];

  React.useEffect(() => {
    const visibleActions = thumbnailActions.filter(({ label }) =>
      configuredActions.some((a) => a.label === label && a.mode.includes(mode))
    );

    const handleKeyDown = (e) => {
      if (e.repeat || modal.opened) return;

      const target = e.target;
      const isEditable =
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
        target.isContentEditable;
      if (isEditable) return;

      const action = visibleActions.find((a) => matchesShortcut(e, a.shortcut));
      if (!action || action.disabled) return;

      e.preventDefault();
      if (action.isFileInput) {
        fileInputRef.current?.click();
      } else {
        action.onClick?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, activePage, clipboard, mode, configuredActions, modal.opened]);

  return (
    <div className={styles["studio-thumbnails"]}>
      <div className={styles.actions}>
        {thumbnailActions
          .filter(({ label }) =>
            configuredActions.some(
              (a) => a.label === label && a.mode.includes(mode)
            )
          )
          .map(({ label, Icon, onClick, isFileInput, disabled, shortcut }) => (
            <Tooltip
              key={label}
              placement="top"
              title={`${label} (${formatShortcut(shortcut)})`}
            >
              <span>
                <IconButton
                  aria-label={label}
                  disabled={disabled}
                  {...(isFileInput ? { component: "label" } : { onClick })}
                >
                  <Icon />
                  {isFileInput && (
                    <VisuallyHiddenInput
                      ref={fileInputRef}
                      type="file"
                      onChange={onChange}
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          ))}
      </div>
      <div className={styles["thumbnails-container"]} ref={containerRef}>
        {pages.map((img, idx) => {
          const isActive = activePage === idx;
          const border = isActive ? "1rem solid #ccc" : "1rem solid transparent";
          return (
            <img
              key={idx}
              src={img?.url || img}
              alt={img?.url || img}
              width="100%"
              onClick={() => onClickImage(idx)}
              style={{ border }}
            />
          );
        })}
      </div>
    </div>
  );
});

export default StudioThumbnails;
