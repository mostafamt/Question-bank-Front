import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { simulateSubmitAutoGen } from "../../../../services/autogen.simulator";

import styles from "./autoGenPanel.module.scss";

/**
 * AutoGenPanel
 * Full-screen overlay showing the current page image with a canvas crop tool.
 * User draws a rectangle over the block they want to generate, then clicks Generate.
 * The cropped image is submitted immediately and the panel closes — no waiting.
 *
 * @param {Object}   props
 * @param {boolean}  props.open            - Whether the panel is open
 * @param {string}   props.pageImageUrl    - URL of the current page image
 * @param {Object}   [props.initialCrop]   - Previous crop percentages { xPct, yPct, widthPct, heightPct }
 * @param {Function} props.onConfirm       - Called with (base64, jobId, cropPct) on generate
 * @param {Function} props.onClose         - Called when panel is dismissed without generating
 */
const AutoGenPanel = ({ open, pageImageUrl, initialCrop, onConfirm, onClose }) => {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const [cropRect, setCropRect] = useState(null); // { x, y, width, height } in canvas px
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Canvas helpers ──────────────────────────────────────────────────────────

  const drawRect = useCallback((rect) => {
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

  const syncCanvasSize = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;
  }, []);

  // Re-draw initialCrop when canvas is ready and open
  useEffect(() => {
    if (!open || !canvasRef.current || !imgRef.current) return;
    syncCanvasSize();
    if (initialCrop) {
      const canvas = canvasRef.current;
      const rect = {
        x: (initialCrop.xPct / 100) * canvas.width,
        y: (initialCrop.yPct / 100) * canvas.height,
        width: (initialCrop.widthPct / 100) * canvas.width,
        height: (initialCrop.heightPct / 100) * canvas.height,
      };
      setCropRect(rect);
      drawRect(rect);
    } else {
      setCropRect(null);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [open, initialCrop, syncCanvasSize, drawRect]);

  // Reset state when panel closes
  useEffect(() => {
    if (!open) {
      setCropRect(null);
      setPreviewUrl(null);
      setError("");
      setLoading(false);
    }
  }, [open]);

  // ─── Mouse event handlers ─────────────────────────────────────────────────

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, canvas.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, canvas.height)),
    };
  };

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const pos = getCanvasPos(e);
    startPosRef.current = pos;
    setIsDragging(true);
    setPreviewUrl(null);
    setError("");
  }, []);

  const handleMouseMove = useCallback(
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

  const handleMouseUp = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      setIsDragging(false);

      const pos = getCanvasPos(e);
      const start = startPosRef.current;
      if (!start) return;

      const rect = {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      };
      startPosRef.current = null;

      if (rect.width < 10 || rect.height < 10) {
        setCropRect(null);
        drawRect(null);
        return;
      }

      setCropRect(rect);
      drawRect(rect);

      // Generate preview
      const img = imgRef.current;
      if (!img) return;
      const scaleX = img.naturalWidth / img.offsetWidth;
      const scaleY = img.naturalHeight / img.offsetHeight;
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = rect.width * scaleX;
      cropCanvas.height = rect.height * scaleY;
      cropCanvas.getContext("2d").drawImage(
        img,
        rect.x * scaleX,
        rect.y * scaleY,
        rect.width * scaleX,
        rect.height * scaleY,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );
      setPreviewUrl(cropCanvas.toDataURL("image/png"));
    },
    [isDragging, drawRect]
  );

  // ─── Generate ────────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!cropRect || cropRect.width < 10 || cropRect.height < 10) {
      setError("Please draw a selection rectangle on the page image.");
      return;
    }

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
      cropRect.x * scaleX,
      cropRect.y * scaleY,
      cropRect.width * scaleX,
      cropRect.height * scaleY,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    const base64 = cropCanvas.toDataURL("image/png");

    const cropPct = {
      xPct: (cropRect.x / canvas.width) * 100,
      yPct: (cropRect.y / canvas.height) * 100,
      widthPct: (cropRect.width / canvas.width) * 100,
      heightPct: (cropRect.height / canvas.height) * 100,
    };

    setLoading(true);
    try {
      const { jobId } = await simulateSubmitAutoGen({ image: base64 });
      onConfirm(base64, jobId, cropPct);
    } catch (err) {
      setError("Failed to submit generation request. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cropRect, onConfirm]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} fullScreen onClose={onClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesomeIcon color="primary" />
          Select Block Region
        </Box>
      </DialogTitle>

      <DialogContent dividers className={styles.content}>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Draw a rectangle over the block you want to auto-generate. Then click{" "}
          <strong>Generate</strong>.
        </Typography>

        {!pageImageUrl ? (
          <Alert severity="warning">
            Page image is not available. Please close and reopen the modal.
          </Alert>
        ) : (
          <div className={styles["image-wrapper"]}>
            <img
              ref={imgRef}
              src={pageImageUrl}
              alt="Page"
              className={styles["page-image"]}
              onLoad={syncCanvasSize}
              draggable={false}
            />
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        )}

        {previewUrl && (
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              Selected region preview:
            </Typography>
            <img
              src={previewUrl}
              alt="Crop preview"
              className={styles.preview}
            />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AutoAwesomeIcon />
            )
          }
          onClick={handleGenerate}
          disabled={loading || !cropRect}
        >
          {loading ? "Submitting…" : "Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoGenPanel;
