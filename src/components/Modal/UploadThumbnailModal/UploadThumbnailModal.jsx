import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useStore } from "../../../store/store";
import { uploadBase64 } from "../../../utils/upload";

const UploadThumbnailModal = () => {
  const { data: state, setFormState } = useStore();

  const [uploading, setUploading] = React.useState(false);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const onClickClipboard = () => {
    navigator.clipboard.writeText(state.thumbnailToUpload);
  };

  React.useEffect(() => {
    upload();
  }, []);

  const upload = async () => {
    setUploading(true);
    if (state.thumbnailToUpload?.includes("blob")) {
      const data = await uploadBase64(state.thumbnailToUpload);
      setFormState({
        ...state,
        thumbnailToUpload: data,
      });
    }
    setUploading(false);
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Upload Thumbnail</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {uploading ? (
          <p>Uploading</p>
        ) : (
          <FormControl sx={{ m: 1, width: "90%" }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Link</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type="text"
              value={state.thumbnailToUpload || ""}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={"Link"}
                    onClick={onClickClipboard}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                    edge="end"
                  >
                    <ContentPasteIcon />
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
        )}
      </BootstrapModal.Body>
    </>
  );
};

export default UploadThumbnailModal;
