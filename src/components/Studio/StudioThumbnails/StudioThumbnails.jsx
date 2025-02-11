import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileCopyIcon from "@mui/icons-material/FileCopy";
// CloudUploadIcon
import { styled } from "@mui/material/styles";
import { Button, IconButton } from "@mui/material";

import styles from "./studioThumbnails.module.scss";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const StudioThumbnails = (props) => {
  const { images, onClickImage, setImages, activeIndex } = props;

  const onChange = (event) => {
    const files = event.target.files;
    const urls = [...files].map((file) => URL.createObjectURL(file));
    console.log("urls= ", urls);
    setImages((prevState) => [...prevState, ...urls]);
  };

  const onDeleteThumbnail = () => {
    const newImages = images.filter((_, idx) => idx !== activeIndex);
    console.log("newImages= ", newImages);
    setImages(newImages);
    // console.log("onDeleteThumbnail");
  };

  const onCopyThumbnail = () => {
    const currentImage = images[activeIndex];
    setImages((prevState) => [...prevState, currentImage]);
  };

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
        <IconButton aria-label="copy" onClick={onCopyThumbnail}>
          <FileCopyIcon />
        </IconButton>
      </div>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img?.url || img}
          alt={img?.url || img}
          width="100%"
          onClick={() => onClickImage(idx)}
          style={{
            border:
              activeIndex === idx
                ? "1rem solid #ccc"
                : "1rem solid transparent",
          }}
        />
      ))}
    </div>
  );
};

export default StudioThumbnails;
