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
import { styled } from "@mui/material/styles";
import { Button, IconButton } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../../../store/store";
import { submitPages, addNewPage } from "../../../api/bookapi";
import { toast } from "react-toastify";

import styles from "./studioThumbnails.module.scss";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import { useAppMode, getTabById } from "../../../utils/tabFiltering";

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
  const { openModal } = useStore();
  const { bookId, chapterId } = useParams();

  const mode = useAppMode();
  const configuredActions = getTabById("thumbnails")?.actions ?? [];

  const containerRef = React.useRef(null);

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

  const onClickExport = () => {
    const activePage = pages[activePage];
    const imageUrl = activePage?.url || activePage;

    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `page-${activePage}.png`;
    a.click();
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
    },
    {
      label: "add",
      Icon: AddPhotoAlternateIcon,
      isFileInput: true,
    },
    {
      label: "delete",
      Icon: DeleteIcon,
      onClick: () => handleDeletePage(activePage),
    },
    {
      label: "copy",
      Icon: ContentCopyIcon,
      onClick: handleCopy,
    },
    {
      label: "cut",
      Icon: ContentCutIcon,
      onClick: handleCut,
      disabled: pages.length === 1,
    },
    {
      label: "paste",
      Icon: ContentPasteIcon,
      onClick: handlePaste,
      disabled: !clipboard,
    },
    {
      label: "import",
      Icon: FileDownloadIcon,
      onClick: onClickImport,
    },
    {
      label: "save",
      Icon: SaveIcon,
      onClick: handleSave,
    },
  ];

  return (
    <div className={styles["studio-thumbnails"]}>
      <div className={styles.actions}>
        {thumbnailActions
          .filter(({ label }) =>
            configuredActions.some(
              (a) => a.label === label && a.mode.includes(mode)
            )
          )
          .map(({ label, Icon, onClick, isFileInput, disabled }) => (
            <Tooltip key={label} placement="top" title={label}>
              <span>
                <IconButton
                  aria-label={label}
                  disabled={disabled}
                  {...(isFileInput
                    ? { component: "label", onChange }
                    : { onClick })}
                >
                  <Icon />
                  {isFileInput && <VisuallyHiddenInput type="file" />}
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
