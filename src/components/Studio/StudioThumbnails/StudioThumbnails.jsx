import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { Button, IconButton } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

import styles from "./studioThumbnails.module.scss";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";

const StudioThumbnails = React.forwardRef((props, ref) => {
  const { pages, setPages, onClickImage, activePage } = props;

  const containerRef = React.useRef(null);

  const onChange = (event) => {
    const files = event.target.files;
    const urls = [...files].map((file) => ({
      _id: uuidv4(),
      blocks: [],
      v_blocks: [],
      url: URL.createObjectURL(file),
    }));
    const newPages = [...pages, ...urls];
    setPages(newPages);
    onClickImage(newPages.length - 1);
  };

  const onDeleteThumbnail = () => {
    const newImages = pages.filter((_, idx) => idx !== activePage);
    setPages(newImages);
    if (newImages.length) {
      onClickImage(Math.max(0, activePage - 1));
    }
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

  return (
    <div className={styles["studio-thumbnails"]}>
      <div className={styles.actions}>
        <IconButton
          aria-label="delete"
          component="label"
          sx={{ padding: 0 }}
          onChange={onChange}
        >
          <AddPhotoAlternateIcon />
          <VisuallyHiddenInput type="file" />
        </IconButton>

        <IconButton aria-label="delete" onClick={onDeleteThumbnail}>
          <DeleteIcon />
        </IconButton>
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
