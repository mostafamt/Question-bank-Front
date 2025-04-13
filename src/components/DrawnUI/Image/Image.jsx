import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoIcon from "@mui/icons-material/Photo";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { default as BootstrapModal } from "react-bootstrap/Modal";

import { upload } from "../../../utils/upload";
import { Controller } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

import styles from "./image.module.scss";
import Modal from "../../Modal/Modal";

const Image = (props) => {
  const { space, setValue, name, getValues, control, errors, path } = props;
  const [coordinate, setCoordinate] = React.useState();
  const [scaledCoordinate, setScaledCoordinate] = React.useState();
  const imageRef = React.createRef();
  const imageRefInModal = React.createRef();
  const [showModal, setShowModal] = React.useState(false);

  let value = getValues(name);
  const [loading, setLoading] = React.useState(false);

  const onChangeHandler = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    // const link =
    // "https://fastly.picsum.photos/id/772/200/200.jpg?hmac=9euSj4JHTPr7uT5QWVmeNJ8JaqAXY8XmJnYfr_DfBJc";
    const link = await upload(file);
    setValue(name, link);
    setLoading(false);
  };

  React.useEffect(() => {}, [scaledCoordinate, showModal]);

  const onChangeInput = (event) => {
    console.log("value= ", event.target.value);
    setValue(name, event.target.value);
    console.log("newValue= ", getValues(name));
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
            rules={{ required: "File is required" }} // Set required rule
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
        rules={{ required: "File is required" }} // Set required rule
        render={({ field }) => (
          <div className={styles.image}>
            <div className={styles["image-area"]}>
              {field.value ? (
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
                <VisuallyHiddenInput type="file" />
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
