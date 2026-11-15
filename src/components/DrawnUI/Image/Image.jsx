import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoIcon from "@mui/icons-material/Photo";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { default as BootstrapModal } from "react-bootstrap/Modal";

import { upload, uploadForStudio } from "../../../utils/upload";
import { acceptFor, validateFile } from "../../../utils/fileTypes";
import { toast } from "react-toastify";
import { Controller } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

import styles from "./image.module.scss";
import Modal from "../../Modal/Modal";

const Image = (props) => {
  const {
    setValue,
    name,
    control,
    errors,
    path,
    setError,
    clearErrors,
    trackUpload = (promise) => promise,
  } = props;
  const [coordinate, setCoordinate] = React.useState();
  const [scaledCoordinate, setScaledCoordinate] = React.useState();
  const imageRef = React.createRef();
  const imageRefInModal = React.createRef();
  const [showModal, setShowModal] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const onChangeHandler = async (event) => {
    const file = event.target.files[0];
    // Reset so picking the same file again still fires onChange
    event.target.value = "";
    if (!file) return;

    const error = validateFile(file, "image");
    if (error) {
      setError?.(name, { type: "file-type", message: error });
      toast.error(error);
      return;
    }
    clearErrors?.(name);

    setLoading(true);
    const link = await trackUpload(upload(file));
    if (link) setValue(name, link, { shouldValidate: true });
    setLoading(false);
  };

  React.useEffect(() => {}, [scaledCoordinate, showModal]);

  const onChangeInput = (event) => {
    setValue(name, event.target.value);
  };

  const onClickImage = (event) => {
    const rect = event.target.getBoundingClientRect();
    const scaledX = event.clientX - rect.left;
    const scaledY = event.clientY - rect.top;
    // console.log("ref= ", imageRef.current.offsetWidth);
    const ratioX = imageRef.current.naturalWidth / imageRef.current.offsetWidth;
    const ratioY =
      imageRef.current.naturalHeight / imageRef.current.offsetHeight;
    const x = parseInt(scaledX * ratioX);
    const y = parseInt(scaledY * ratioY);
    setCoordinate({ x, y });
    setScaledCoordinate({
      x: (scaledX / imageRef.current.offsetWidth) * 100,
      y: (scaledY / imageRef.current.offsetHeight) * 100,
    });
  };

  const onClickImageInModal = (event) => {
    const rect = event.target.getBoundingClientRect();
    const scaledX = event.clientX - rect.left;
    const scaledY = event.clientY - rect.top;
    const ratioX =
      imageRefInModal.current.naturalWidth /
      imageRefInModal.current.offsetWidth;
    const ratioY =
      imageRefInModal.current.naturalHeight /
      imageRefInModal.current.offsetHeight;
    const x = parseInt(scaledX * ratioX);
    const y = parseInt(scaledY * ratioY);
    setCoordinate({ x, y });
    setScaledCoordinate({
      x: (scaledX / imageRefInModal.current.offsetWidth) * 100,
      y: (scaledY / imageRefInModal.current.offsetHeight) * 100,
    });
  };

  const onClickFullScreen = () => {
    setShowModal(true);
  };

  const onCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Box>
      <Modal show={showModal} handleClose={onCloseModal} fullScreen={true}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title></BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div className={styles["modal-image-area"]}>
                <img
                  src={field.value}
                  alt={field.value}
                  onClick={onClickImageInModal}
                  ref={imageRefInModal}
                />
                {scaledCoordinate && (
                  <div
                    className={styles.info}
                    style={{
                      left: `${scaledCoordinate.x}%`,
                      top: `${scaledCoordinate.y}%`,
                    }}
                  ></div>
                )}
                {coordinate && (
                  <p>
                    x: {coordinate?.x}, y: {coordinate?.y}
                  </p>
                )}
              </div>
            )}
          />
        </BootstrapModal.Body>
      </Modal>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={styles.image}>
            <div
              className={styles["image-area"]}
              onDragOver={(e) => {
                e.preventDefault();
                if (e.dataTransfer.types.includes("application/x-area-image"))
                  setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragOver(false);
                const base64 = e.dataTransfer.getData("application/x-area-image");
                if (!base64) return;
                // Scanned areas are always images, so they skip the file-type check
                clearErrors?.(name);
                setLoading(true);
                const url = await trackUpload(uploadForStudio(base64));
                if (url) setValue(name, url, { shouldValidate: true });
                setLoading(false);
              }}
              style={{
                outline: isDragOver ? "2px dashed #1976d2" : undefined,
                borderRadius: isDragOver ? 4 : undefined,
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <CircularProgress size="2rem" />
                </Box>
              ) : field.value ? (
                <>
                  <div className={styles["full-screen"]}>
                    <FullscreenIcon onClick={onClickFullScreen} />
                  </div>
                  <img
                    src={field.value}
                    alt={field.value}
                    onClick={onClickImage}
                    ref={imageRef}
                  />
                  {scaledCoordinate && (
                    <div
                      className={styles.info}
                      style={{
                        left: `${scaledCoordinate.x}%`,
                        top: `${scaledCoordinate.y}%`,
                      }}
                    ></div>
                  )}
                </>
              ) : (
                <div className={styles.icon}>
                  <PhotoIcon fontSize="large" />
                </div>
              )}
            </div>
            <div className={styles.inputs}>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                color="secondary"
                onChange={onChangeHandler}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size="1rem" />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
              >
                Upload Image
                <VisuallyHiddenInput type="file" accept={acceptFor("image")} />
              </Button>

              <TextField
                label="Add Url"
                variant="outlined"
                fullWidth
                value={field.value}
                onChange={onChangeInput}
              />
            </div>
          </div>
        )}
      />
      {coordinate && (
        <p>
          x: {coordinate?.x}, y: {coordinate?.y}
        </p>
      )}
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Image;
