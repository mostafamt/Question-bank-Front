import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuillEditor from "react-quill";
import { quillModules } from "../../../utils/quill";
import RadioQuestionsTable from "../../Tables/RadioQuestionsTable/RadioQuestionsTable";
import { simulateSubmitAutoGen } from "../../../services/autogen.simulator";

import styles from "./virtualBlockContentModal.module.scss";

/**
 * ContentItemForm Component
 * Form for adding/editing a single content item
 *
 * @param {Object} props
 * @param {string} props.selectedLabel - The block label
 * @param {string} props.iconLocation - The icon position
 * @param {Object} props.editingContent - Content being edited (null for new)
 * @param {string} [props.pageImageUrl] - URL of the current page image (for AutoGen inline crop)
 * @param {Function} props.onSubmit - Submit handler, receives contentItem
 * @param {Function} props.onCancel - Cancel handler
 */
const ContentItemForm = (props) => {
  const {
    selectedLabel,
    iconLocation,
    editingContent = null,
    pageImageUrl,
    onSubmit,
    onCancel,
  } = props;

  // Initialize state based on editing content or defaults
  const [contentType, setContentType] = React.useState(
    editingContent?.type || "text"
  );
  const [textValue, setTextValue] = React.useState(
    editingContent?.type === "text" ? editingContent.contentValue : ""
  );
  const [linkValue, setLinkValue] = React.useState(
    editingContent?.type === "link" ? editingContent.contentValue : ""
  );
  const [objectValue, setObjectValue] = React.useState(
    editingContent?.type === "object" ? editingContent.contentValue : ""
  );
  const [error, setError] = React.useState("");

  // ─── AutoGen inline crop state ────────────────────────────────────────────
  const imgRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const startPosRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [cropRect, setCropRect] = React.useState(null);   // display-px rect
  const [previewUrl, setPreviewUrl] = React.useState(
    // Pre-fill thumbnail when editing an existing autogen item
    editingContent?.type === "autogen" ? editingContent.contentValue : null
  );
  const [autoGenLoading, setAutoGenLoading] = React.useState(false);

  // ─── Canvas helpers ───────────────────────────────────────────────────────

  const drawRect = React.useCallback((rect) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!rect || rect.width === 0 || rect.height === 0) return;
    ctx.strokeStyle = "#1976d2";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = "rgba(25, 118, 210, 0.12)";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }, []);

  const syncCanvasSize = React.useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    // Use getBoundingClientRect so canvas attribute size matches the exact
    // rendered pixel dimensions — prevents coordinate drift.
    const r = img.getBoundingClientRect();
    canvas.width = Math.round(r.width);
    canvas.height = Math.round(r.height);
  }, []);

  // Restore previous crop rectangle when editing an autogen item
  React.useEffect(() => {
    if (
      contentType !== "autogen" ||
      !editingContent?.cropRect ||
      !canvasRef.current ||
      !imgRef.current
    )
      return;

    const { xPct, yPct, widthPct, heightPct } = editingContent.cropRect;
    const canvas = canvasRef.current;
    const rect = {
      x: (xPct / 100) * canvas.width,
      y: (yPct / 100) * canvas.height,
      width: (widthPct / 100) * canvas.width,
      height: (heightPct / 100) * canvas.height,
    };
    setCropRect(rect);
    drawRect(rect);
  }, [contentType, editingContent, drawRect]);

  // ─── Mouse handlers ───────────────────────────────────────────────────────

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const domRect = canvas.getBoundingClientRect();
    // Scale from CSS pixels to canvas coordinate space in case they differ
    const scaleX = canvas.width / domRect.width;
    const scaleY = canvas.height / domRect.height;
    return {
      x: Math.max(0, Math.min((e.clientX - domRect.left) * scaleX, canvas.width)),
      y: Math.max(0, Math.min((e.clientY - domRect.top) * scaleY, canvas.height)),
    };
  };

  const handleMouseDown = React.useCallback((e) => {
    e.preventDefault();
    startPosRef.current = getCanvasPos(e);
    setIsDragging(true);
    setPreviewUrl(null);
    setError("");
  }, []);

  const handleMouseMove = React.useCallback(
    (e) => {
      if (!isDragging || !startPosRef.current) return;
      e.preventDefault();
      const pos = getCanvasPos(e);
      const start = startPosRef.current;
      const rect = {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      };
      setCropRect(rect);
      drawRect(rect);
    },
    [isDragging, drawRect]
  );

  const handleMouseUp = React.useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      setIsDragging(false);

      const pos = getCanvasPos(e);
      const start = startPosRef.current;
      startPosRef.current = null;
      if (!start) return;

      const rect = {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      };

      if (rect.width < 10 || rect.height < 10) {
        setCropRect(null);
        drawRect(null);
        return;
      }

      setCropRect(rect);
      drawRect(rect);

      // Generate preview thumbnail
      const img = imgRef.current;
      if (!img) return;
      const scaleX = img.naturalWidth / img.offsetWidth;
      const scaleY = img.naturalHeight / img.offsetHeight;
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = rect.width * scaleX;
      cropCanvas.height = rect.height * scaleY;
      cropCanvas.getContext("2d").drawImage(
        img,
        rect.x * scaleX, rect.y * scaleY,
        rect.width * scaleX, rect.height * scaleY,
        0, 0, cropCanvas.width, cropCanvas.height
      );
      setPreviewUrl(cropCanvas.toDataURL("image/png"));
    },
    [isDragging, drawRect]
  );

  // ─── Form validation ──────────────────────────────────────────────────────

  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    switch (contentType) {
      case "text":
        if (!textValue || textValue.trim() === "" || textValue === "<p><br></p>") {
          setError("Please enter some text content");
          return false;
        }
        break;
      case "link":
        if (!linkValue.trim()) { setError("Please enter a URL"); return false; }
        if (!isValidUrl(linkValue)) {
          setError("Please enter a valid URL (e.g., https://example.com)");
          return false;
        }
        break;
      case "object":
        if (!objectValue) { setError("Please select an object"); return false; }
        break;
      case "autogen":
        if (!cropRect || cropRect.width < 10 || cropRect.height < 10) {
          setError("Please draw a selection rectangle on the page image.");
          return false;
        }
        break;
      default:
        setError("Invalid content type");
        return false;
    }
    return true;
  };

  // ─── Submission ───────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (contentType === "autogen") {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas) return;

      const scaleX = img.naturalWidth / img.offsetWidth;
      const scaleY = img.naturalHeight / img.offsetHeight;
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = cropRect.width * scaleX;
      cropCanvas.height = cropRect.height * scaleY;
      cropCanvas.getContext("2d").drawImage(
        img,
        cropRect.x * scaleX, cropRect.y * scaleY,
        cropRect.width * scaleX, cropRect.height * scaleY,
        0, 0, cropCanvas.width, cropCanvas.height
      );
      const base64 = cropCanvas.toDataURL("image/png");

      const cropPct = {
        xPct: (cropRect.x / canvas.width) * 100,
        yPct: (cropRect.y / canvas.height) * 100,
        widthPct: (cropRect.width / canvas.width) * 100,
        heightPct: (cropRect.height / canvas.height) * 100,
      };

      setAutoGenLoading(true);
      try {
        const { jobId } = await simulateSubmitAutoGen({ image: base64 });
        if (onSubmit) {
          onSubmit({
            type: "autogen",
            contentValue: base64,
            jobId,
            status: "pending",
            objectId: null,
            errorMessage: null,
            cropRect: cropPct,
          });
        }
      } catch {
        setError("Failed to submit generation request. Please try again.");
      } finally {
        setAutoGenLoading(false);
      }
      return;
    }

    // Text / Link / Object
    let contentValue;
    switch (contentType) {
      case "text":   contentValue = textValue;   break;
      case "link":   contentValue = linkValue;   break;
      case "object": contentValue = objectValue; break;
      default:       contentValue = "";
    }
    if (onSubmit) onSubmit({ type: contentType, contentValue });
  };

  const handleCancel = () => { if (onCancel) onCancel(); };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles["content-form"]}>
      {/* Content Type Selector */}
      <Box mb={2}>
        <Typography variant="body2" gutterBottom>
          Content Type
        </Typography>
        <ToggleButtonGroup
          value={contentType}
          exclusive
          onChange={(_, v) => { if (v) { setContentType(v); setError(""); } }}
          aria-label="content type"
          fullWidth
          size="small"
        >
          <ToggleButton value="text"   aria-label="text content">📄 Text</ToggleButton>
          <ToggleButton value="link"   aria-label="link content">🔗 Link</ToggleButton>
          <ToggleButton value="object" aria-label="object content">🎮 Object</ToggleButton>
          <ToggleButton value="autogen" aria-label="auto-generate content">
            <AutoAwesomeIcon fontSize="small" sx={{ mr: 0.5 }} />
            AutoGen
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content Input Based on Type */}
      <Box mb={2}>
        {contentType === "text" && (
          <div className={styles["text-editor"]}>
            <Typography variant="body2" gutterBottom>Text Content</Typography>
            <QuillEditor
              className={styles.editor}
              theme="snow"
              value={textValue}
              onChange={setTextValue}
              modules={quillModules}
              placeholder="Enter your text content here..."
            />
          </div>
        )}

        {contentType === "link" && (
          <TextField
            fullWidth
            label="Enter Link URL"
            placeholder="https://example.com"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            variant="outlined"
            type="url"
            helperText="Enter a valid HTTP or HTTPS URL"
          />
        )}

        {contentType === "object" && (
          <div className={styles["object-selector"]}>
            <Typography variant="body2" gutterBottom>Select Interactive Object</Typography>
            <RadioQuestionsTable object={objectValue} setObject={setObjectValue} />
          </div>
        )}

        {contentType === "autogen" && (
          <div className={styles["autogen-crop-area"]}>
            <Typography variant="body2" gutterBottom>
              Draw a rectangle on the page to define the block region.
            </Typography>

            {!pageImageUrl ? (
              <Alert severity="warning">
                Page image is not available for this block location.
              </Alert>
            ) : (
              <div className={styles["autogen-image-wrapper"]}>
                <img
                  ref={imgRef}
                  src={pageImageUrl}
                  alt="Page"
                  className={styles["autogen-page-image"]}
                  crossOrigin="anonymous"
                  onLoad={syncCanvasSize}
                  draggable={false}
                />
                <canvas
                  ref={canvasRef}
                  className={styles["autogen-canvas"]}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            )}

            {previewUrl && (
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Selected region:
                </Typography>
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className={styles["autogen-thumbnail"]}
                />
              </Box>
            )}
          </div>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Box mb={2}>
          <Typography variant="body2" color="error">{error}</Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={autoGenLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={autoGenLoading}
          startIcon={autoGenLoading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {autoGenLoading
            ? "Submitting…"
            : contentType === "autogen"
            ? editingContent?.type === "autogen" ? "Regenerate" : "Generate"
            : editingContent ? "Update" : "Add to List"}
        </Button>
      </Box>
    </div>
  );
};

export default ContentItemForm;
