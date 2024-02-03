import { Button } from "@mui/material";
import React from "react";
import Tesseract from "tesseract.js";

import styles from "./ocr.module.scss";
import Loader from "../../components/Loader/Loader";

const OCR = React.forwardRef((props, ref) => {
  const { areas, parameters, setExtractedTextList, loading, setLoading } =
    props;
  const canvasRef = React.createRef();

  const onClickExtract = async () => {
    setLoading(true);
    const image = ref.current;
    const ratio = image.naturalWidth / image.width;

    setExtractedTextList([]);

    await Promise.all(
      areas.map(async (area, idx) => {
        console.log("area= ", area);
        const x = area.x * ratio;
        const y = area.y * ratio;
        const width = area.width * ratio;
        const height = area.height * ratio;
        const text = await extract(x, y, width, height, parameters[idx]);
      })
    );
    setLoading(false);
  };

  const extract = async (x, y, width, height, parameter) => {
    const canvas = canvasRef.current;
    const image = ref.current;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    const ctx2 = canvas.getContext("2d");
    const finalImage = ctx2.getImageData(0, 0, canvas.width, canvas.height);
    ctx2.putImageData(finalImage, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      const result = await Tesseract.recognize(dataUrl, "eng");
      let text = result.data.text;
      setExtractedTextList((prevState) => [
        ...prevState,
        { text, parameter, y },
      ]);
      return text;
    } catch (err) {
      console.error(err);
    }
    return "";
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <div className={styles["submit-box"]}>
        <Button variant="contained" onClick={onClickExtract}>
          extract text
        </Button>
      </div>
      {loading && <Loader text="Extracting Text..." />}
    </div>
  );
});

export default OCR;
