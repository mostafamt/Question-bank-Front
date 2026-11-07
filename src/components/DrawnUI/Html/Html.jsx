import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  TextField,
} from "@mui/material";
import { useWatch } from "react-hook-form";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HtmlIcon from "@mui/icons-material/Html";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import { upload } from "../../../utils/upload";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

import styles from "./html.module.scss";

// Uploaded pages are untrusted: allow their scripts but keep them away from
// this app's origin, cookies and top-level navigation.
// Never add allow-same-origin here, it lets the page remove its own sandbox.
export const SANDBOX = "allow-scripts";

const Html = (props) => {
  const { setValue, name, control, errors, path } = props;

  // In edit mode the saved value arrives after this component mounts
  const value = useWatch({ control, name }) || "";
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showViewer, setShowViewer] = React.useState(false);

  React.useEffect(() => {
    setUrl(value);
  }, [value]);

  const update = (next) => {
    setValue(name, next, { shouldValidate: true });
    setUrl(next);
  };

  const onChangeHandler = async (event) => {
    const file = event.target.files[0];
    // Reset so picking the same file again still fires onChange
    event.target.value = "";
    if (!file) return;

    setLoading(true);
    const link = await upload(file);
    if (link) update(link);
    setLoading(false);
  };

  const onChangeInput = (event) => {
    setUrl(event.target.value);
  };

  // Commit on blur so the iframe doesn't reload on every keystroke
  const onBlurInput = () => {
    if (url !== value) update(url);
  };

  return (
    <Box>
      <Dialog
        fullScreen
        open={showViewer}
        onClose={() => setShowViewer(false)}
      >
        <div className={styles.viewer}>
          <IconButton
            className={styles.close}
            aria-label="close"
            onClick={() => setShowViewer(false)}
          >
            <CloseIcon />
          </IconButton>
          <iframe src={value} title={`${name} full screen`} sandbox={SANDBOX} />
        </div>
      </Dialog>
      <Box className={styles.html}>
        <div className={styles["html-area"]}>
          {loading ? (
            <CircularProgress size="2rem" />
          ) : value ? (
            <>
              <IconButton
                size="small"
                className={styles["full-screen"]}
                aria-label="view full screen"
                onClick={() => setShowViewer(true)}
              >
                <FullscreenIcon />
              </IconButton>
              <iframe
                src={value}
                title={name}
                sandbox={SANDBOX}
                loading="lazy"
              />
            </>
          ) : (
            <HtmlIcon fontSize="large" />
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
              loading ? <CircularProgress size="1rem" /> : <CloudUploadIcon />
            }
          >
            Upload HTML
            <VisuallyHiddenInput type="file" accept=".html,.htm,text/html" />
          </Button>

          <TextField
            label="Add Url"
            variant="outlined"
            value={url}
            onChange={onChangeInput}
            onBlur={onBlurInput}
            disabled={loading}
            fullWidth
          />
        </div>
      </Box>
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Html;
