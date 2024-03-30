import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
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

  return (
    <div className={styles.thumbnails}>
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
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={img}
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
