import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Typography } from "@mui/material";
import { toast } from "react-toastify";
import axios from "../../../axios";
import styles from "./snapLearningPlayer.module.scss";

const SnapLearningPlayer = ({ data }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [iframeUrl, setIframeUrl] = React.useState("");
  const [iframeLoading, setIframeLoading] = React.useState(false);
  const [paragraphValues, setParagraphValues] = React.useState([]);

  const slides = data?.parameters?.Slides || [];
  const title = data?.parameters?.Title || "";
  const total = slides.length;
  const slide = slides[currentSlide];

  React.useEffect(() => {
    setParagraphValues(slides.map((s) => s?.Paragraph || ""));
  }, [data]);

  const hasMedia = slide?.Picture || slide?.Voice;

  React.useEffect(() => {
    if (!slide?.InteractiveObject || hasMedia) return;
    setIframeLoading(true);
    setIframeUrl("");
    axios
      .get(`/interactive-objects/${slide.InteractiveObject}`)
      .then((res) => setIframeUrl(res.data?.url || ""))
      .catch((err) => toast.error(`${err?.message}, please try again later!`))
      .finally(() => setIframeLoading(false));
  }, [slide?.InteractiveObject, hasMedia]);

  if (total === 0) {
    return (
      <div className={`container ${styles.player}`}>
        <Typography variant="h6">{title}</Typography>
        <Typography>No slides available.</Typography>
      </div>
    );
  }

  return (
    <div className={`container ${styles.player}`}>
      <div className={styles.header}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2">
          Slide {currentSlide + 1} of {total}
        </Typography>
      </div>

      <div className={styles.body}>
        <div className={styles.iframePanel}>
          {hasMedia ? (
            <div className={styles.mediaPanel}>
              {slide.Picture && (
                <img
                  src={slide.Picture}
                  alt={`slide-${currentSlide}`}
                  className={styles.picture}
                />
              )}
              {slide.Voice && (
                <audio controls src={slide.Voice} className={styles.audio} />
              )}
            </div>
          ) : iframeLoading ? (
            <div className={styles.placeholder}>Loading...</div>
          ) : iframeUrl ? (
            <iframe
              key={iframeUrl}
              title={`slide-${currentSlide}`}
              src={iframeUrl}
              className={styles.iframe}
            />
          ) : (
            <div className={styles.placeholder}>No object for this slide.</div>
          )}
        </div>

        <div className={styles.textPanel}>
          <ReactQuill
            theme="snow"
            value={paragraphValues[currentSlide] || ""}
            onChange={(val) =>
              setParagraphValues((prev) => {
                const updated = [...prev];
                updated[currentSlide] = val;
                return updated;
              })
            }
          />
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          variant="outlined"
          onClick={() => setCurrentSlide((s) => s - 1)}
          disabled={currentSlide === 0}
        >
          ← Prev
        </Button>
        <Button
          variant="outlined"
          onClick={() => setCurrentSlide((s) => s + 1)}
          disabled={currentSlide === total - 1}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};

export default SnapLearningPlayer;
