import React from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { Button, IconButton } from "@mui/material";

import styles from "./studioThumbnails.module.scss";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";

const StudioThumbnails = (props) => {
  const { pages, onClickImage, activePage } = props;

  const onChange = (event) => {
    // const files = event.target.files;
    // const urls = [...files].map((file) => URL.createObjectURL(file));
    // console.log("urls= ", urls);
    // setImages((prevState) => [...prevState, ...urls]);
  };

  const onDeleteThumbnail = () => {
    // const newImages = pages.filter((_, idx) => idx !== activePage);
    // console.log("newImages= ", newImages);
    // setImages(newImages);
    // console.log("onDeleteThumbnail");
  };

  return (
    <div className={styles["studio-thumbnails"]}>
      <div className={styles.actions}>
        <IconButton
          aria-label="delete"
          component="label"
          sx={{ padding: 0 }}
          onChange={onChange}
          disabled
        >
          <AddPhotoAlternateIcon />
          <VisuallyHiddenInput type="file" />
        </IconButton>

        <IconButton aria-label="delete" onClick={onDeleteThumbnail} disabled>
          <DeleteIcon />
        </IconButton>
      </div>
      {pages.map((img, idx) => (
        <img
          key={idx}
          src={img?.url || img}
          alt={img?.url || img}
          width="100%"
          onClick={() => onClickImage(idx)}
          style={{
            border:
              activePage === idx ? "1rem solid #ccc" : "1rem solid transparent",
          }}
        />
      ))}
    </div>
  );
};

export default StudioThumbnails;
