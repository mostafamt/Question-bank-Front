import React from "react";
import Tesseract from "tesseract.js";
import { preprocessImage } from "../../utils";

import styles from "./test.module.scss";

const Test = () => {
  const [imagePath, setImagePath] = React.useState("");
  const [text, setText] = React.useState("");
  const canvasRef = React.useRef(null);
  const imageRef = React.useRef(null);

  const handleChange = (event) => {
    setImagePath(URL.createObjectURL(event.target.files[0]));
  };

  const handleClick = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 183, 412, 890, 83, 0, 0, 890, 83);

    const ctx2 = canvas.getContext("2d");
    const finalImage = ctx2.getImageData(0, 0, canvas.width, canvas.height);

    ctx2.putImageData(finalImage, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    Tesseract.recognize(dataUrl, "eng", {
      logger: (m) => console.log(m),
    })
      .catch((err) => {
        console.error(err);
      })
      .then((result) => {
        // Get Confidence score
        let confidence = result.confidence;

        let text = result.data.text;
        console.log("result= ", result);
        setText(text);
      });
  };

  return (
    <div className="App">
      <main className="App-main">
        <h3>Actual imagePath uploaded</h3>
        <img src={imagePath} ref={imageRef} className="App-image" alt="logo" />

        <h3>Canvas</h3>
        <canvas ref={canvasRef} width={700} height={250}></canvas>

        <h3>Extracted text</h3>
        <div className="text-box">
          <p> {text} </p>
        </div>
        <input type="file" onChange={handleChange} />
        <button onClick={handleClick} style={{ height: 50 }}>
          {" "}
          convert to text
        </button>
      </main>
    </div>
  );
};

export default Test;
