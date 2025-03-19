import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
// CloudUploadIcon
import { styled } from "@mui/material/styles";
import { Button, IconButton } from "@mui/material";

import styles from "./studioThumbnails.module.scss";
import { useStore } from "../../../store/store";

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
  const { images, onClickImage, setImages, activeIndex, openModal } = props;
  const { data: state, setFormState } = useStore();

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

  const onDownloadThumbnail = () => {
    const currentImage = images[activeIndex];
    downloadImage(currentImage);
  };

  async function downloadImage(imageSrc) {
    const image = await fetch(imageSrc);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "page";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const onUploadThumbnail = async () => {
    setFormState({
      ...state,
      modal: "Upload Thumbnail",
      modalSize: "md",
      thumbnailToUpload: images[activeIndex],
    });
    openModal();
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
        <IconButton aria-label="download" onClick={onDownloadThumbnail}>
          <DownloadIcon />
        </IconButton>
        <IconButton aria-label="upload" onClick={onUploadThumbnail}>
          <LinkIcon />
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
