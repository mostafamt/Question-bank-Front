import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { styled } from "@mui/material/styles";
import { Button, IconButton } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "../../../store/store";

import styles from "./studioThumbnails.module.scss";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import { useAppMode, getTabById } from "../../../utils/tabFiltering";

const StudioThumbnails = React.forwardRef((props, ref) => {
  const {
    pages,
    setPages,
    addBlankPage,
    addLocalPages,
    deletePage,
    onClickImage,
    activePage,
  } = props;

  const { openModal } = useStore();

  const mode = useAppMode();
  const configuredActions = getTabById("thumbnails")?.actions ?? [];

  const containerRef = React.useRef(null);

  console.log("mode= ", mode);

  const onChange = (event) => {
    addLocalPages?.(event.target.files, activePage);
  };

  const onClickDuplicate = () => {};

  const onClickImport = () => {
    openModal("import-pages", {});
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
      onClick: () => addBlankPage?.(activePage),
    },
    {
      label: "add",
      Icon: AddPhotoAlternateIcon,
      isFileInput: true,
    },
    {
      label: "delete",
      Icon: DeleteIcon,
      onClick: () => deletePage?.(activePage),
    },
    {
      label: "duplicate",
      Icon: FileCopyIcon,
      onClick: onClickDuplicate,
    },
    {
      label: "import",
      Icon: PublishIcon,
      onClick: onClickImport,
    },
    {
      label: "export",
      Icon: FileDownloadIcon,
      onClick: onClickExport,
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
          .map(({ label, Icon, onClick, isFileInput }) => (
            <Tooltip key={label} placement="top" title={label}>
              <IconButton
                aria-label={label}
                onClick={onClick}
                {...(isFileInput
                  ? { component: "label", onChange }
                  : { onClick })}
              >
                <Icon />
                {isFileInput && <VisuallyHiddenInput type="file" />}
              </IconButton>
            </Tooltip>
          ))}
      </div>
      <div className={styles["thumbnails-container"]} ref={containerRef}>
        {pages.map((img, idx) => (
          <img
            key={idx}
            src={img?.url || img}
            alt={img?.url || img}
            width="100%"
            onClick={() => onClickImage(idx)}
            style={{
              border:
                activePage === idx
                  ? "1rem solid #ccc"
                  : "1rem solid transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
});

export default StudioThumbnails;
