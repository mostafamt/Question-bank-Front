import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  TextField,
} from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ReplayIcon from "@mui/icons-material/Replay";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import { upload } from "../../../utils/upload";
import { fileToImages } from "../../../services/api";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

import styles from "./pdf.module.scss";

const PPTX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const FILE_KINDS = {
  pdf: {
    label: "PDF",
    accept: "application/pdf",
    fileName: "document.pdf",
    mimeType: "application/pdf",
    Icon: PictureAsPdfIcon,
  },
  ppt: {
    label: "PowerPoint",
    accept: `.ppt,.pptx,application/vnd.ms-powerpoint,${PPTX_MIME_TYPE}`,
    fileName: "presentation.pptx",
    mimeType: PPTX_MIME_TYPE,
    Icon: SlideshowIcon,
  },
};

const getFileSignature = (file) =>
  `${file.name}-${file.size}-${file.lastModified}`;

const fileFromUrl = async (url, { fileName, mimeType }) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.log("error= ", error);
    return null;
  }
};

const Pdf = (props) => {
  const { setValue, name, getValues, errors, path, kind = "pdf" } = props;
  const fileKind = FILE_KINDS[kind];
  const { Icon } = fileKind;

  const [value, setLocalValue] = React.useState(getValues(name) || null);
  const [url, setUrl] = React.useState(getValues(name)?.url || "");
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [showViewer, setShowViewer] = React.useState(false);
  // Keeps the picked file so a failed step can be retried without picking it again
  const fileRef = React.useRef(null);

  const pages = value?.pages ?? [];

  const update = (next) => {
    setLocalValue(next);
    setValue(name, next, { shouldValidate: true });
    setUrl(next.url || "");
    setPage(0);
  };

  // Runs only the steps that are still missing: uploading to the bucket and/or converting to images
  const runMissingSteps = async (current) => {
    setLoading(true);
    const file = fileRef.current;
    const needsUpload = !current.url && Boolean(file);
    const needsPages = !current.pages?.length;

    const [link, images] = await Promise.all([
      needsUpload ? upload(file) : current.url,
      needsPages
        ? (async () => {
            const source = file || (await fileFromUrl(current.url, fileKind));
            return source ? fileToImages(source) : [];
          })()
        : current.pages,
    ]);

    update({ url: link || "", pages: images || [] });
    setLoading(false);
  };

  const onChangeHandler = async (event) => {
    const file = event.target.files[0];
    // Reset so picking the same file again still fires onChange
    event.target.value = "";
    if (!file) return;

    const isSameFile =
      fileRef.current &&
      getFileSignature(fileRef.current) === getFileSignature(file);
    fileRef.current = file;

    // Same file already in the bucket: reuse its url and only fill what is missing
    await runMissingSteps(isSameFile ? { url: value?.url, pages } : {});
  };

  const onChangeInput = (event) => {
    setUrl(event.target.value);
  };

  const onBlurInput = async () => {
    if (!url || url === value?.url) return;
    fileRef.current = null;
    await runMissingSteps({ url });
  };

  const onClickRetry = () => runMissingSteps({ url: value?.url, pages });

  const canRetry =
    Boolean(value) &&
    ((!value.url && Boolean(fileRef.current)) ||
      (!pages.length && Boolean(fileRef.current || value.url)));

  const retryLabel = !value?.url && !pages.length
    ? "Retry"
    : !value?.url
    ? "Retry upload"
    : "Retry conversion";

  const pager = pages.length > 1 && (
    <div className={styles.pager}>
      <IconButton
        size="small"
        aria-label="previous page"
        disabled={page === 0}
        onClick={() => setPage((prevState) => prevState - 1)}
      >
        <NavigateBeforeIcon />
      </IconButton>
      <span>
        Page {page + 1} / {pages.length}
      </span>
      <IconButton
        size="small"
        aria-label="next page"
        disabled={page >= pages.length - 1}
        onClick={() => setPage((prevState) => prevState + 1)}
      >
        <NavigateNextIcon />
      </IconButton>
    </div>
  );

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
          <img src={pages[page]} alt={`Page ${page + 1}`} />
          {pager}
        </div>
      </Dialog>
      <Box className={styles.pdf}>
        <div className={styles["pdf-area"]}>
          <div className={styles.preview}>
            {loading ? (
              <CircularProgress size="2rem" />
            ) : pages.length ? (
              <>
                <IconButton
                  size="small"
                  className={styles["full-screen"]}
                  aria-label="view full screen"
                  onClick={() => setShowViewer(true)}
                >
                  <FullscreenIcon />
                </IconButton>
                <img src={pages[page]} alt={`Page ${page + 1}`} />
              </>
            ) : (
              <Icon fontSize="large" />
            )}
          </div>
          {!loading && pager}
          {!loading && canRetry && (
            <div className={styles.pager}>
              <Button
                size="small"
                color="error"
                startIcon={<ReplayIcon />}
                onClick={onClickRetry}
                fullWidth
              >
                {retryLabel}
              </Button>
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
              loading ? <CircularProgress size="1rem" /> : <CloudUploadIcon />
            }
          >
            Upload {fileKind.label}
            <VisuallyHiddenInput type="file" accept={fileKind.accept} />
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

export default Pdf;
