import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SaveIcon from "@mui/icons-material/Save";
import { CircularProgress, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { IconButton } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../store/store";
import { submitPages, addNewPage, convertPdfToImages } from "../../../api/bookapi";
import { saveBlocks } from "../../../services/api";
import { upload } from "../../../utils/upload";
import { toast } from "react-toastify";

import styles from "./studioThumbnails.module.scss";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import { useAppMode, getTabById } from "../../../utils/tabFiltering";
import { WHITE_PAGE_FALLBACK, UPLOAD_FILE_TYPES } from "../constants";

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
    addEmptyPage,
    addImportedPages,
    insertPageLocally,
    reorderPages,
    onClickImage,
    activePage,
    onPageDeleted,
  } = props;

  const [clipboard, setClipboard] = React.useState(null);
  const [isUploadingFiles, setIsUploadingFiles] = React.useState(false);

  const queryClient = useQueryClient();
  const { openModal, modal } = useStore();
  const { bookId, chapterId } = useParams();

  const mode = useAppMode();
  const configuredActions = getTabById("thumbnails")?.actions ?? [];

  const containerRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const handleAddFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = null; // allow re-selecting the same file(s) later
    if (!files.length) return;

    setIsUploadingFiles(true);
    try {
      const fileUrlGroups = await Promise.all(
        files.map(async (file) => {
          if (file.type === UPLOAD_FILE_TYPES.PDF_MIME) {
            const { pages: pdfPages } = await convertPdfToImages(file);
            return pdfPages ?? [];
          }
          const url = await upload(file);
          return url ? [url] : [];
        })
      );
      const urls = fileUrlGroups.flat();
      if (!urls.length) {
        toast.error("No pages could be added from the selected file(s).");
        return;
      }

      const mintedPages = await Promise.all(
        urls.map(() => addNewPage({ chapterId }))
      );
      const importedPages = mintedPages.map(({ pageId }, i) => ({
        pageId,
        url: urls[i],
      }));

      addImportedPages(activePage, importedPages, { needsPageUrlSync: true });
      toast.success(
        `${importedPages.length} page(s) added. Click Save to persist.`
      );
    } catch {
      toast.error("Failed to add page(s) from file.");
    } finally {
      setIsUploadingFiles(false);
    }
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

      const pagesNeedingUrlSync = pages.filter((p) => p._pendingPageUrlSync);
      if (pagesNeedingUrlSync.length) {
        await Promise.allSettled(
          pagesNeedingUrlSync.map((p) =>
            saveBlocks({ pageId: p._id, chapterId, pageUrl: p.url, blocks: [] })
          )
        );
      }

      setPages(
        pages.map((p) => ({
          ...p,
          _isPending: false,
          _pendingPageUrlSync: false,
        }))
      );
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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    reorderPages?.(from, to);
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
      disabled: isUploadingFiles,
      loading: isUploadingFiles,
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
  }, [
    pages,
    activePage,
    clipboard,
    mode,
    configuredActions,
    modal.opened,
    isUploadingFiles,
  ]);

  return (
    <div className={styles["studio-thumbnails"]}>
      <div className={styles.actions}>
        {thumbnailActions
          .filter(({ label }) =>
            configuredActions.some(
              (a) => a.label === label && a.mode.includes(mode)
            )
          )
          .map(
            ({
              label,
              Icon,
              onClick,
              isFileInput,
              disabled,
              loading,
              shortcut,
            }) => (
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
                  {loading ? <CircularProgress size={20} /> : <Icon />}
                  {isFileInput && (
                    <VisuallyHiddenInput
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={UPLOAD_FILE_TYPES.ACCEPT}
                      onChange={handleAddFiles}
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          ))}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="studio-thumbnails">
          {(provided) => (
            <div
              className={styles["thumbnails-container"]}
              ref={(el) => {
                containerRef.current = el;
                provided.innerRef(el);
              }}
              {...provided.droppableProps}
            >
              {pages.map((img, idx) => {
                const key = img?._id ?? idx;
                const isActive = activePage === idx;
                const border = isActive
                  ? "1rem solid #ccc"
                  : "1rem solid transparent";
                // Get image source with fallback to white canvas if URL is missing
                const imgSrc = img?.url && typeof img.url === 'string' && img.url.trim().length > 0
                  ? img.url
                  : WHITE_PAGE_FALLBACK;
                return (
                  <Draggable key={key} draggableId={String(key)} index={idx}>
                    {(dragProvided, snapshot) => (
                      <img
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        src={imgSrc}
                        alt={img?.url || img}
                        width="100%"
                        onClick={() => onClickImage(idx)}
                        style={{
                          border,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                          ...dragProvided.draggableProps.style,
                        }}
                      />
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});

export default StudioThumbnails;
